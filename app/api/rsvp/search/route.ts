import { createRsvpClient, noStore } from "../database";

type GuestRow = {
  invitation_id: string;
  rsvp_token: string;
  plus_one_allowed: boolean;
  guest_id: string;
  first_name: string;
  last_name: string;
  attending: boolean | null;
  plus_one_name: string | null;
  plus_one_attending: boolean | null;
};

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return noStore({ error: "Request not allowed." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStore({ error: "Please enter a name to search." }, { status: 400 });
  }

  const name = body && typeof body === "object" && "name" in body
    ? String(body.name).trim()
    : "";
  if (!name || name.length > 100) {
    return noStore({ error: "Please enter a name to search." }, { status: 400 });
  }

  const client = createRsvpClient();
  if (!client) {
    return noStore({ error: "The RSVP system is temporarily unavailable." }, { status: 503 });
  }

  try {
    await client.connect();
    const result = await client.query<GuestRow>(
      `SELECT i.id::text AS invitation_id,
              i.rsvp_token::text AS rsvp_token,
              i.plus_one_allowed,
              g.id::text AS guest_id,
              g.first_name,
              g.last_name,
              r.attending,
              p.name AS plus_one_name,
              p.attending AS plus_one_attending
         FROM invitations i
         JOIN guests g ON g.invitation_id = i.id
         LEFT JOIN rsvps r ON r.guest_id = g.id
         LEFT JOIN plus_ones p ON p.invitation_id = i.id
        WHERE i.id IN (
          SELECT g2.invitation_id
            FROM guests g2
           WHERE LOWER(TRIM(g2.last_name)) = LOWER($1)
              OR LOWER(TRIM(g2.first_name)) = LOWER($1)
              OR LOWER(TRIM(CONCAT_WS(' ', g2.first_name, g2.last_name))) = LOWER($1)
        )
        ORDER BY i.id, g.id
        LIMIT 200`,
      [name],
    );

    if (result.rows.length === 0) {
      return noStore({ error: "No invitations matched that name.", invitations: [] }, { status: 404 });
    }

    const invitations = new Map<string, {
      invitationId: string;
      token: string;
      plusOneAllowed: boolean;
      plusOne: { name: string; attending: boolean } | null;
      guests: Array<{
        id: number;
        firstName: string;
        lastName: string;
        attending: boolean | null;
      }>;
    }>();

    for (const row of result.rows) {
      let invitation = invitations.get(row.invitation_id);
      if (!invitation) {
        invitation = {
          invitationId: row.invitation_id,
          token: row.rsvp_token,
          plusOneAllowed: row.plus_one_allowed,
          plusOne: row.plus_one_name
            ? { name: row.plus_one_name, attending: row.plus_one_attending === true }
            : null,
          guests: [],
        };
        invitations.set(row.invitation_id, invitation);
      }
      invitation.guests.push({
        id: Number(row.guest_id),
        firstName: row.first_name,
        lastName: row.last_name,
        attending: row.attending,
      });
    }

    return noStore({ invitations: [...invitations.values()] });
  } catch (error) {
    console.error("RSVP name search failed", error instanceof Error ? error.message : error);
    return noStore({ error: "The RSVP system is temporarily unavailable." }, { status: 503 });
  } finally {
    await client.end().catch(() => undefined);
  }
}
