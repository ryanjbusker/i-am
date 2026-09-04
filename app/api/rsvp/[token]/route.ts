import { Client } from "pg";
import { createRsvpClient, noStore } from "../database";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type DbGuestRow = {
  id: string;
  first_name: string;
  last_name: string;
  attending: boolean | null;
};

type DbInvitationRow = { id: string; plus_one_allowed: boolean };
type DbPlusOneRow = { name: string; attending: boolean };

function createClient() {
  return createRsvpClient();
}

async function findInvitation(client: Client, token: string) {
  const invitationResult = await client.query<DbInvitationRow>(
    `SELECT id, plus_one_allowed
       FROM invitations
      WHERE rsvp_token = $1::uuid
      LIMIT 1`,
    [token],
  );
  return invitationResult.rows[0] ?? null;
}

async function invitationPayload(client: Client, invitation: DbInvitationRow) {
  const [guestsResult, plusOneResult] = await Promise.all([
    client.query<DbGuestRow>(
      `SELECT g.id, g.first_name, g.last_name, r.attending
         FROM guests g
         LEFT JOIN rsvps r ON r.guest_id = g.id
        WHERE g.invitation_id = $1
        ORDER BY g.id`,
      [invitation.id],
    ),
    client.query<DbPlusOneRow>(
      `SELECT name, attending FROM plus_ones WHERE invitation_id = $1 LIMIT 1`,
      [invitation.id],
    ),
  ]);

  const guests = guestsResult.rows.map((guest) => ({
    id: Number(guest.id),
    firstName: guest.first_name,
    lastName: guest.last_name,
    rsvp: guest.attending === null ? null : {
      attending: guest.attending,
    },
  }));

  return {
    plusOneAllowed: invitation.plus_one_allowed,
    guests,
    plusOne: plusOneResult.rows[0] ? {
      name: plusOneResult.rows[0].name,
      attending: plusOneResult.rows[0].attending,
    } : null,
    hasResponded: guests.some((guest) => guest.rsvp !== null),
  };
}

function publicDatabaseError() {
  return noStore(
    { error: "The RSVP system is temporarily unavailable. Please try again shortly." },
    { status: 503 },
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID_PATTERN.test(token)) return noStore({ error: "That RSVP code is not valid." }, { status: 400 });
  const client = createClient();
  if (!client) return publicDatabaseError();

  try {
    await client.connect();
    const invitation = await findInvitation(client, token);
    if (!invitation) return noStore({ error: "We couldn’t find an invitation for that RSVP code." }, { status: 404 });
    return noStore(await invitationPayload(client, invitation));
  } catch (error) {
    console.error("RSVP lookup failed", error instanceof Error ? error.message : error);
    return publicDatabaseError();
  } finally {
    await client.end().catch(() => undefined);
  }
}

function optionalText(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_TEXT");
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error("TEXT_TOO_LONG");
  return normalized || null;
}

export async function PUT(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID_PATTERN.test(token)) return noStore({ error: "That RSVP code is not valid." }, { status: 400 });
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return noStore({ error: "Request not allowed." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 50_000) return noStore({ error: "Request is too large." }, { status: 413 });

  let body: unknown;
  try { body = await request.json(); } catch { return noStore({ error: "The RSVP response is not valid." }, { status: 400 }); }
  if (!body || typeof body !== "object") return noStore({ error: "The RSVP response is not valid." }, { status: 400 });

  const submitted = body as { responses?: unknown; plusOne?: unknown };
  if (!Array.isArray(submitted.responses) || submitted.responses.length === 0 || submitted.responses.length > 30) {
    return noStore({ error: "Please respond for each invited guest." }, { status: 400 });
  }

  let responses: Array<{ guestId: number; attending: boolean }>;
  try {
    responses = submitted.responses.map((value) => {
      if (!value || typeof value !== "object") throw new Error("INVALID_RESPONSE");
      const row = value as Record<string, unknown>;
      if (!Number.isSafeInteger(row.guestId) || Number(row.guestId) <= 0 || typeof row.attending !== "boolean") throw new Error("INVALID_RESPONSE");
      return {
        guestId: Number(row.guestId),
        attending: row.attending,
      };
    });
  } catch {
    return noStore({ error: "One or more guest responses are not valid." }, { status: 400 });
  }

  const responseIds = new Set(responses.map((response) => response.guestId));
  if (responseIds.size !== responses.length) return noStore({ error: "A guest response was submitted more than once." }, { status: 400 });

  const client = createClient();
  if (!client) return publicDatabaseError();
  try {
    await client.connect();
    await client.query("BEGIN");
    const invitation = await findInvitation(client, token);
    if (!invitation) { await client.query("ROLLBACK"); return noStore({ error: "We couldn’t find an invitation for that RSVP code." }, { status: 404 }); }

    const invitedGuests = await client.query<{ id: string }>("SELECT id FROM guests WHERE invitation_id = $1 ORDER BY id FOR UPDATE", [invitation.id]);
    const invitedIds = invitedGuests.rows.map((guest) => Number(guest.id));
    if (invitedIds.length !== responseIds.size || invitedIds.some((id) => !responseIds.has(id))) {
      await client.query("ROLLBACK");
      return noStore({ error: "The submitted guests do not match this invitation." }, { status: 403 });
    }

    for (const response of responses) {
      await client.query(
        `INSERT INTO rsvps (guest_id, attending, submitted_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (guest_id) DO UPDATE SET
           attending = EXCLUDED.attending,
           submitted_at = NOW(),
           updated_at = NOW()`,
        [response.guestId, response.attending],
      );
    }

    if (invitation.plus_one_allowed) {
      const plusOne = submitted.plusOne && typeof submitted.plusOne === "object" ? submitted.plusOne as Record<string, unknown> : null;
      if (plusOne?.attending === true) {
        const name = optionalText(plusOne.name, 200);
        if (!name) { await client.query("ROLLBACK"); return noStore({ error: "Please enter your guest’s name." }, { status: 400 }); }
        await client.query(
          `INSERT INTO plus_ones (invitation_id, name, attending)
           VALUES ($1, $2, TRUE)
           ON CONFLICT (invitation_id) DO UPDATE SET name = EXCLUDED.name, attending = TRUE, updated_at = NOW()`,
          [invitation.id, name],
        );
      } else {
        await client.query("DELETE FROM plus_ones WHERE invitation_id = $1", [invitation.id]);
      }
    } else if (submitted.plusOne && (submitted.plusOne as { attending?: unknown }).attending === true) {
      await client.query("ROLLBACK");
      return noStore({ error: "This invitation does not include a plus-one." }, { status: 403 });
    }

    await client.query("COMMIT");
    return noStore({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("RSVP save failed", error instanceof Error ? error.message : error);
    return publicDatabaseError();
  } finally {
    await client.end().catch(() => undefined);
  }
}
