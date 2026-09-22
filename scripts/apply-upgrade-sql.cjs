// One-time helper: apply setup-supabase-upgrade.sql to the Supabase project
// by finding the right pooler region (IPv4-reachable) and running the SQL.
// After successful use, `pg` is removed from package.json again.
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const REF = "gyqdrwbpgeaironcsphe";
const PASSWORD = "THISisnotforanyPASSWORD?018";
const REGIONS = [
  "eu-north-1",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "ap-southeast-1",
  "ap-south-1",
];

async function tryConnect(region) {
  const client = new Client({
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 5432,
    user: `postgres.${REF}`,
    password: PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await client.connect();
    return client;
  } catch (err) {
    try { await client.end(); } catch {}
    return null;
  }
}

(async () => {
  let client = null;
  let usedRegion = null;
  for (const region of REGIONS) {
    process.stdout.write(`trying ${region}... `);
    client = await tryConnect(region);
    if (client) {
      console.log("CONNECTED");
      usedRegion = region;
      break;
    }
    console.log("no");
  }
  if (!client) {
    console.error("No region reachable — run the SQL manually.");
    process.exit(1);
  }

  const sql = fs.readFileSync(
    path.join(__dirname, "..", "setup-supabase-upgrade.sql"),
    "utf8"
  );
  try {
    await client.query(sql);
    console.log("MIGRATION APPLIED via", usedRegion);
  } catch (err) {
    console.error("Migration error:", err.message);
    await client.end();
    process.exit(1);
  }

  // verify
  const res = await client.query(
    "select table_name from information_schema.tables where table_schema='public' order by table_name"
  );
  console.log("tables:", res.rows.map((r) => r.table_name).join(", "));
  const cols = await client.query(
    "select column_name from information_schema.columns where table_name='products'"
  );
  console.log("product columns include images:", cols.rows.some((r) => r.column_name === "images"));
  await client.end();
})();
