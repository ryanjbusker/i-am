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

test("save-the-date page renders without password gate", async () => {
  const response = await fetch(`${baseUrl}/save-the-date`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  
  // Should have save-the-date in the route
  assert.match(html, /route:\/save-the-date/i, "Page should be for save-the-date route");
  
  // Title should be save-the-date specific, not the default wedding website title
  assert.match(html, /Save the Date - Ryan &amp; Eleanor/i, "Page should have Save the Date title");
  assert.doesNotMatch(html, /March 6, 2027.*wedding celebration/i, "Should not have main site description");
  
  // Layout should be save-the-date specific
  assert.match(html, /layout:\/save-the-date/i, "Page should use save-the-date layout");
});

test("save-the-date page has noindex meta tag", async () => {
  const response = await fetch(`${baseUrl}/save-the-date`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  
  // Check for noindex in meta tags
  assert.match(html, /<meta[^>]+name="robots"[^>]+content="[^"]*noindex[^"]*"/i, "Page should have noindex meta tag");
});

test("save-the-date page has X-Robots-Tag header", async () => {
  const response = await fetch(`${baseUrl}/save-the-date`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  
  const robotsHeader = response.headers.get('x-robots-tag');
  assert.ok(robotsHeader, "Page should have X-Robots-Tag header");
  assert.match(robotsHeader, /noindex/i, "X-Robots-Tag should include noindex");
  assert.match(robotsHeader, /nofollow/i, "X-Robots-Tag should include nofollow");
});

test("no pages link to save-the-date", async () => {
  const pagesToCheck = ['/', '/photos', '/faq', '/registry'];
  
  for (const page of pagesToCheck) {
    const response = await fetch(`${baseUrl}${page}`, { headers: { accept: "text/html" } });
    
    if (response.status === 200) {
      const html = await response.text();
      assert.doesNotMatch(
        html, 
        /href="[^"]*\/save-the-date/i, 
        `${page} should not link to /save-the-date`
      );
    }
  }
});
