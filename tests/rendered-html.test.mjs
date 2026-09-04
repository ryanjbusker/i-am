import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
async function getWorker() {
  const freshUrl = new URL(workerUrl);
  freshUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(freshUrl.href)).default;
}
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const context = { waitUntil() {}, passThroughOnException() {} };

test("server-renders the RSVP name search", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), env, context);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>RSVP test<\/title>/i);
  assert.match(html, /Enter your name/);
  assert.match(html, /Finding invitation|Find invitation/);
});

test("keeps the token RSVP backend", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(new Request("http://localhost/api/rsvp/not-a-token"), env, context);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "That RSVP code is not valid." });
});

test("validates last-name lookup input before database access", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(new Request("http://localhost/api/rsvp/lookup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ lastName: "" }),
  }), env, context);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Please enter a valid last name." });
});

test("validates name search input before database access", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(new Request("http://localhost/api/rsvp/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "" }),
  }), env, context);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Please enter a name to search." });
});
