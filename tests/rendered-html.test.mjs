import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const serverPath = fileURLToPath(new URL("../dist/standalone/server.js", import.meta.url));
const port = 3200 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
let server;

before(async () => {
  server = spawn(process.execPath, [serverPath], {
    // No DATABASE_URL: these tests must pass without touching a database.
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1", DATABASE_URL: "" },
    stdio: "ignore",
  });

  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      await fetch(baseUrl, { signal: AbortSignal.timeout(1_000) });
      return;
    } catch {
      if (Date.now() > deadline) throw new Error("standalone server did not start");
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
});

after(() => {
  server?.kill();
});

test("server-renders the wedding landing page", async () => {
  const response = await fetch(baseUrl, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Ryan &(?:amp;|#x27;)? ?Eleanor[^<]*<\/title>/i);
  assert.match(html, /The Garden Estate/);
  assert.match(html, /RSVP Now/);
});

test("server-renders the RSVP name search", async () => {
  const response = await fetch(`${baseUrl}/rsvp`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Enter your name/);
  assert.match(html, /Find invitation/);
});

test("rejects an RSVP token that is not a UUID", async () => {
  const response = await fetch(`${baseUrl}/api/rsvp/not-a-token`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "That RSVP code is not valid." });
});

test("validates last-name lookup input before database access", async () => {
  const response = await fetch(`${baseUrl}/api/rsvp/lookup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ lastName: "" }),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Please enter a valid last name." });
});

test("validates name search input before database access", async () => {
  const response = await fetch(`${baseUrl}/api/rsvp/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "" }),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Please enter a name to search." });
});
