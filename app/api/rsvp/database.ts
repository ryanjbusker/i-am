import { Client } from "pg";

export function databaseUrl() {
  return process.env.DATABASE_URL?.trim() ?? "";
}

export function createRsvpClient() {
  const connectionString = databaseUrl();
  if (!connectionString) return null;
  return new Client({
    connectionString,
    connectionTimeoutMillis: 8_000,
    query_timeout: 10_000,
    ssl: { rejectUnauthorized: false },
  });
}

export function noStore(payload: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("cache-control", "no-store, max-age=0");
  headers.set("referrer-policy", "no-referrer");
  return Response.json(payload, { ...init, headers });
}
