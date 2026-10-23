import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const serverPath = fileURLToPath(new URL("../dist/standalone/server.js", import.meta.url));
const port = 3200 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const reportsDir = await mkdtemp(path.join(tmpdir(), "reports-"));
const reportsPath = path.join(reportsDir, "submissions.json");
let server;

before(async () => {
  server = spawn(process.execPath, [serverPath], {
    // No DATABASE_URL: these tests must pass without touching a database.
    env: {
      ...process.env,
      PORT: String(port),
      HOST: "127.0.0.1",
      DATABASE_URL: "",
      REPORTS_DATA_PATH: reportsPath,
    },
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

after(async () => {
  server?.kill();
  await rm(reportsDir, { recursive: true, force: true });
});

test("server-renders the wedding landing page", async () => {
  const response = await fetch(baseUrl, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Ryan &(?:amp;|#x27;)? ?Eleanor[^<]*<\/title>/i);
  assert.match(html, /The Garden Estate/);
  assert.match(html, /Corpus Christi/);
});

test("server-renders the wedding schedule", async () => {
  const response = await fetch(`${baseUrl}/schedule`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Wedding Schedule/);
  assert.match(html, /Ceremony/);
});

test("admin board lists party chiefs for Monday through Saturday", async () => {
  const response = await fetch(`${baseUrl}/admin?week=2020-01-06&day=2020-01-06`, {
    headers: { accept: "text/html" },
  });
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const name of [
    "Jordan Haven",
    "Donnie Johnson",
    "Mike Kennedy",
    "Steven Kaldanis",
    "Luis Rivero",
    "Tyler Alridge",
    "Andy Brito",
    "Cody Grissom",
    "Zack Page",
    "Arturo Valtierra",
    "Ja'Ciery Linzer",
    "Ja&#x27;Ciery Linzer",
    "Rod Chandler",
    "Jacob Moore",
    "Peter Baumhogger",
    "Matt Marek",
    "Masen Gorman",
    "Dustin Coffee",
    "Woodlands Party Chiefs",
  ]) {
    if (name.startsWith("Ja")) {
      assert.match(html, /Ja(?:&#x27;|&#39;|')Ciery Linzer/);
      continue;
    }
    assert.match(html, new RegExp(name));
  }

  const headers = [...html.matchAll(/class="desk-dayhead[^"]*"[^>]*>([\s\S]*?)<\/th>/g)].map(
    (match) => match[1],
  );
  assert.equal(headers.length, 6);
  assert.match(headers[0], /Monday/);
  assert.match(headers[5], /Saturday/);
  assert.equal(headers.some((header) => /Sunday/.test(header)), false);
  assert.match(html, /data-chief="donnie-johnson"[^>]*data-date="2020-01-06"[^>]*data-state="missing"/);
});

test("rejects a Sunday report and records a weekday report", async () => {
  const sunday = await fetch(`${baseUrl}/api/reports`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chiefId: "jordan-haven", date: "2020-01-12", submitted: true }),
  });
  assert.equal(sunday.status, 400);
  assert.deepEqual(await sunday.json(), { error: "Reports are not due on Sunday." });

  const unknown = await fetch(`${baseUrl}/api/reports`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chiefId: "not-a-chief", date: "2020-01-06", submitted: true }),
  });
  assert.equal(unknown.status, 400);

  const saved = await fetch(`${baseUrl}/api/reports`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chiefId: "jordan-haven", date: "2020-01-06", submitted: true }),
  });
  assert.equal(saved.status, 200);

  const board = await fetch(`${baseUrl}/api/reports?week=2020-01-06&day=2020-01-06`);
  assert.equal(board.status, 200);
  const payload = await board.json();
  assert.deepEqual(
    payload.days.map((day) => day.date),
    ["2020-01-06", "2020-01-07", "2020-01-08", "2020-01-09", "2020-01-10", "2020-01-11"],
  );
  assert.equal(
    payload.submissions.some((submission) => submission.chiefId === "jordan-haven" && submission.date === "2020-01-06"),
    true,
  );

  const htmlResponse = await fetch(`${baseUrl}/admin?week=2020-01-06&day=2020-01-06`, {
    headers: { accept: "text/html" },
  });
  const html = await htmlResponse.text();
  assert.match(html, /data-chief="jordan-haven"[^>]*data-date="2020-01-06"[^>]*data-state="submitted"/);
  assert.doesNotMatch(html, /data-chief="jordan-haven"[^>]*data-date="2020-01-06"[^>]*data-state="missing"/);
});
