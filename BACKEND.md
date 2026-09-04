# RSVP backend

## Data model

An invitation is one household. Everything else hangs off it.

```
invitations 1───N guests 1───0..1 rsvps
     │
     └── 0..1 plus_ones
```

- `invitations` — `id`, public `rsvp_token` (UUID used in `/rsvp/:token`), and
  `plus_one_allowed`.
- `guests` — the named people on an invitation, via `invitation_id`.
- `rsvps` — one reply per guest, keyed by a unique `guest_id`. No row means the
  guest has not responded yet.
- `plus_ones` — at most one unnamed extra guest per invitation, only when
  `plus_one_allowed` is true. Removing the row means no plus-one is coming.

## Main files

- `app/api/rsvp/search/route.ts` — POST name search
- `app/api/rsvp/lookup/route.ts` — POST last-name lookup
- `app/api/rsvp/[token]/route.ts` — GET and PUT RSVP API
- `app/api/rsvp/database.ts` — shared PostgreSQL client and response helpers
- `db/render-postgres-rsvp.sql` — PostgreSQL `updated_at` triggers
- `.env.example` — expected server-side database setting

## API

`POST /api/rsvp/search` takes a first name, last name, or full name and returns
every matching invitation with all of its guests.

`POST /api/rsvp/lookup` takes a last name and returns a single invitation token,
or an error when the name matches zero or several invitations.

`GET /api/rsvp/:token` returns the invitation, named guests, saved responses,
and optional plus-one.

`PUT /api/rsvp/:token` creates or updates each named guest's response and the
optional plus-one. It verifies that every submitted guest belongs to the
invitation identified by the token.

## Required environment setting

Set `DATABASE_URL` to the PostgreSQL connection URL. Keep it as a server-side
secret and include `sslmode=require` when connecting over the internet.

The backend expects the existing `invitations`, `guests`, `rsvps`, and
`plus_ones` tables.
