import { createRsvpClient, noStore } from "../database";

type TokenRow = { rsvp_token: string };

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return noStore({ error: "Request not allowed." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStore({ error: "Please enter a valid last name." }, { status: 400 });
  }

  const lastName = body && typeof body === "object" && "lastName" in body
    ? String(body.lastName).trim()
    : "";
  if (!lastName || lastName.length > 100) {
    return noStore({ error: "Please enter a valid last name." }, { status: 400 });
  }

  const client = createRsvpClient();
  if (!client) {
    return noStore({ error: "The RSVP system is temporarily unavailable." }, { status: 503 });
  }

  try {
    await client.connect();
    const result = await client.query<TokenRow>(
      `SELECT DISTINCT i.rsvp_token::text AS rsvp_token
         FROM invitations i
         JOIN guests g ON g.invitation_id = i.id
        WHERE LOWER(TRIM(g.last_name)) = LOWER($1)
        ORDER BY i.rsvp_token::text
        LIMIT 2`,
      [lastName],
    );

    if (result.rows.length === 0) {
      return noStore({ error: "We couldn’t find an invitation with that last name." }, { status: 404 });
    }
    if (result.rows.length > 1) {
      return noStore(
        { error: "More than one invitation uses that last name. Please use your private invitation link." },
        { status: 409 },
      );
    }
    return noStore({ token: result.rows[0].rsvp_token });
  } catch (error) {
    console.error("Last-name lookup failed", error instanceof Error ? error.message : error);
    return noStore({ error: "The RSVP system is temporarily unavailable." }, { status: 503 });
  } finally {
    await client.end().catch(() => undefined);
  }
}
