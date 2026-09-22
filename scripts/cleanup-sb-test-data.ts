// Remove test orders + the test customer created during E2E testing.
// Uses the Supabase REST API with the secret key from .env (never committed).

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SECRET_KEY) {
  console.error("Supabase env not configured");
  process.exit(1);
}

async function sb(path: string, method: string = "GET") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      apikey: SECRET_KEY!,
      Authorization: `Bearer ${SECRET_KEY!}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  const testCustomers = (await sb("/customers?select=id,email,name&email=eq.testi.kayttaja@example.com")) as {
    id: number;
  }[];

  for (const c of testCustomers) {
    // Orders linked to the customer (customer_id) or matching the test email.
    const del1 = await sb(`/orders?customer_id=eq.${c.id}`, "DELETE");
    console.log(`deleted orders by customer_id=${c.id}:`, Array.isArray(del1) ? del1.length : 0);
    const del2 = await sb(`/orders?email=eq.testi.kayttaja@example.com`, "DELETE");
    console.log(`deleted orders by test email:`, Array.isArray(del2) ? del2.length : 0);
    const delC = await sb(`/customers?id=eq.${c.id}`, "DELETE");
    console.log(`deleted customer ${c.id}:`, Array.isArray(delC) ? delC.length : 0);
  }

  if (testCustomers.length === 0) {
    console.log("no test customer found; cleaning any stray test orders");
    const del = await sb(`/orders?customer_name=eq.Testi Kayttaja`, "DELETE");
    console.log("deleted stray test orders:", Array.isArray(del) ? del.length : 0);
  }

  const remainingOrders = (await sb("/orders?select=id&limit=1000")) as unknown[];
  const remainingCustomers = (await sb("/customers?select=id&limit=1000")) as unknown[];
  console.log(`remaining orders: ${remainingOrders.length}, remaining customers: ${remainingCustomers.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
