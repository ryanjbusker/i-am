# Preserved RSVP backend

The custom website frontend has been removed. The backend remains active and can
be used by any future website design.

## Main files

- `app/api/rsvp/[token]/route.ts` — GET and PUT RSVP API
- `db/render-postgres-rsvp.sql` — PostgreSQL `updated_at` triggers
- `.env.example` — expected server-side database setting

## API

`GET /api/rsvp/:token` returns the invitation, named guests, saved responses,
and optional plus-one.

`PUT /api/rsvp/:token` creates or updates each named guest's response and the
optional plus-one. It verifies that every submitted guest belongs to the
invitation identified by the token.

## Required environment setting

Set `DATABASE_URL` to the Render external PostgreSQL connection URL. Keep it as
a server-side secret and include `sslmode=require`.

The backend expects the existing `invitations`, `guests`, `rsvps`, and
`plus_ones` tables described in the project context.
