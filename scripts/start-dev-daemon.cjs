// Start the dev server as a true daemon (survives the calling process),
// mimicking how the agent-browser daemon survives in this sandbox.
const { spawn, execSync } = require("child_process");
const fs = require("fs");

const LOG = "/home/z/my-project/dev.log";
const PIDFILE = "/home/z/my-project/.zscripts/dev.pid";

// kill anything already on port 3000
try {
  const out = execSync("ss -ltnp 2>/dev/null | grep ':3000' || true").toString();
  const m = out.match(/pid=(\d+)/);
  if (m) {
    try { execSync(`kill -9 ${m[1]}`); } catch {}
    console.log("killed existing pid", m[1]);
  }
} catch {}

const out = fs.openSync(LOG, "a");
const err = fs.openSync(LOG, "a");

const child = spawn("bun", ["dev"], {
  cwd: "/home/z/my-project",
  detached: true,
  stdio: ["ignore", out, err],
});

child.unref();
fs.writeFileSync(PIDFILE, String(child.pid));
console.log("daemon started, pid", child.pid);

// wait until it answers
const deadline = Date.now() + 40_000;
(async () => {
  while (Date.now() < deadline) {
    try {
      const res = await fetch("http://localhost:3000/");
      console.log("server ready:", res.status);
      process.exit(0);
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.log("server did not come up in time");
  process.exit(1);
})();
