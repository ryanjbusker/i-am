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
  assert.match(html, /Corpus Christi Cathedral/);
  assert.match(html, /April 2027/);
});

test("server-renders the photos page", async () => {
  const response = await fetch(`${baseUrl}/photos`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Ryan &(?:amp;|#x27;)? ?Eleanor[^<]*<\/title>/i);
});

test("server-renders the FAQ page", async () => {
  const response = await fetch(`${baseUrl}/faq`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Ryan &(?:amp;|#x27;)? ?Eleanor[^<]*<\/title>/i);
});

test("server-renders the registry page", async () => {
  const response = await fetch(`${baseUrl}/registry`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Ryan &(?:amp;|#x27;)? ?Eleanor[^<]*<\/title>/i);
});

test("returns 404 for the removed schedule page", async () => {
  const response = await fetch(`${baseUrl}/schedule`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 404);
});
