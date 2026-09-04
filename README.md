# Wedding RSVP

A wedding RSVP site built with [vinext](https://github.com/cloudflare/vinext)
(Next.js App Router on Vite) and PostgreSQL. Guests look up their invitation by
name and respond for everyone in their party.

## Prerequisites

- Node.js `>=22.13.0`
- A PostgreSQL database with the `invitations`, `guests`, `rsvps`, and
  `plus_ones` tables

## Local development

```bash
npm install
cp .env.example .env   # then set DATABASE_URL
npm run dev
```

The site runs at http://localhost:3000.

## Environment

| Variable       | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string. Keep it a server-side secret.    |

Use `sslmode=require` when connecting to a managed database over the internet.

## Deploying (Render web service)

The build produces a standalone Node server, so any host that can run Node
works.

| Setting       | Value                          |
| ------------- | ------------------------------ |
| Environment   | Node                           |
| Build command | `npm install && npm run build` |
| Start command | `npm start`                    |

Set `DATABASE_URL` in the host's environment variables. The server reads `PORT`
and `HOST`, both of which Render provides.

## Pages and API

- `/` — name search; finds the invitation a guest belongs to
- `/rsvp/:token` — RSVP form for everyone on that invitation
- `POST /api/rsvp/search` — invitations matching a first, last, or full name
- `POST /api/rsvp/lookup` — last name to a single invitation token
- `GET`/`PUT /api/rsvp/:token` — read and save an invitation's responses

See [BACKEND.md](./BACKEND.md) for the data model.

## Useful commands

- `npm run dev` — start local development
- `npm run build` — build `dist/standalone/`
- `npm start` — run the production server
- `npm test` — build, then verify rendering and API validation
- `npm run lint` — lint the project
