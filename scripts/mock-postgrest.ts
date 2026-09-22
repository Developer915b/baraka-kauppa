/**
 * Minimal in-memory PostgREST mock — only implements the endpoints and
 * query patterns used by src/lib/supabase.ts. For local E2E testing:
 *   bun scripts/mock-postgrest.ts   (port 4000)
 *   SUPABASE_URL=http://localhost:4000 in .env.local
 */
type Product = {
  id: number;
  created_at: string;
  slug: string;
  name_en: string;
  name_fi: string;
  desc_en: string;
  desc_fi: string;
  price: number;
  old_price: number | null;
  unit: string;
  category: string;
  image: string;
  badge: string | null;
  best_seller: boolean;
  stock: number;
};

type Order = {
  id: number;
  created_at: string;
  order_no: string;
  customer_name: string;
  phone: string;
  email: string | null;
  method: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  notes: string | null;
  items: unknown;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
};

const state = {
  products: [] as Product[],
  orders: [] as Order[],
  nextProductId: 1,
  nextOrderId: 1,
};

const TABLES = new Set(["products", "orders"]);

function likeToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

function matchCond(value: unknown, op: string, operand: string): boolean {
  switch (op) {
    case "eq":
      return String(value).toLowerCase() === operand.toLowerCase();
    case "ilike":
      return likeToRegex(operand).test(String(value));
    case "is":
      return operand === "null" ? value === null || value === undefined : Boolean(value);
    case "not": {
      // not.is.null / not.eq.X
      const dot = operand.indexOf(".");
      const innerOp = operand.slice(0, dot);
      const innerVal = operand.slice(dot + 1);
      return !matchCond(value, innerOp, innerVal);
    }
    case "in": {
      const inner = operand.replace(/^\(/, "").replace(/\)$/, "");
      const set = inner.split(",").map((s) => s.trim());
      return set.includes(String(value));
    }
    default:
      return true;
  }
}

/** Parse or=(a.ilike.*x*,b.ilike.*y*) -> OR of conditions. */
function matchOr(row: Record<string, unknown>, expr: string): boolean {
  const inner = expr.replace(/^\(/, "").replace(/\)$/, "");
  // split on commas that are not inside *…* patterns — our values never contain commas
  return inner.split(",").some((cond) => {
    const dot = cond.indexOf(".");
    const col = cond.slice(0, dot);
    const rest = cond.slice(dot + 1);
    const dot2 = rest.indexOf(".");
    const op = rest.slice(0, dot2);
    const operand = decodeURIComponent(rest.slice(dot2 + 1));
    return matchCond(row[col], op, operand);
  });
}

function filterRows(rows: Record<string, unknown>[], params: URLSearchParams): Record<string, unknown>[] {
  let out = rows;
  const orConds: string[] = [];
  for (const [key, raw] of params.entries()) {
    if (["select", "order", "limit", "on_conflict"].includes(key)) continue;
    if (key === "or") {
      orConds.push(raw);
      continue;
    }
    const dot = raw.indexOf(".");
    const op = raw.slice(0, dot);
    const operand = raw.slice(dot + 1);
    out = out.filter((row) => matchCond(row[key], op, operand));
  }
  for (const cond of orConds) {
    out = out.filter((row) => matchOr(row, cond));
  }
  return out;
}

function sortRows(rows: Record<string, unknown>[], orderParam: string | null): Record<string, unknown>[] {
  if (!orderParam) return rows;
  const cols = orderParam.split(",");
  return [...rows].sort((a, b) => {
    for (const spec of cols) {
      const [col, dir] = spec.split(".");
      const av = a[col] as number | string;
      const bv = b[col] as number | string;
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      if (cmp !== 0) return dir === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

const server = Bun.serve({
  port: 4000,
  async fetch(req) {
    const url = new URL(req.url);
    const rawParts = url.pathname.split("/").filter(Boolean);
    // Accept both "/products" and PostgREST-style "/rest/v1/products"
    const parts = rawParts[0] === "rest" && rawParts[1] === "v1" ? rawParts.slice(2) : rawParts;
    const table = parts[0];
    const method = req.method;

    if (!TABLES.has(table)) {
      return new Response(JSON.stringify({ message: `Bad route ${url.pathname}` }), { status: 404 });
    }
    if (parts[1]) {
      return new Response(JSON.stringify({ message: "Single-object routes not supported" }), { status: 404 });
    }

    const params = url.searchParams;
    const rows = table === "products" ? state.products : state.orders;
    const prefer = req.headers.get("Prefer") ?? "";

    if (method === "GET") {
      let out = filterRows(rows as unknown as Record<string, unknown>[], params);
      out = sortRows(out, params.get("order"));
      const limit = params.get("limit");
      if (limit) out = out.slice(0, Number(limit));
      return new Response(JSON.stringify(out), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);

    if (method === "POST") {
      if (table === "products") {
        const list = Array.isArray(body) ? body : [body];
        const upsert = prefer.includes("merge-duplicates");
        const created: Product[] = [];
        for (const item of list) {
          const existing = upsert ? state.products.find((p) => p.slug === item.slug) : undefined;
          if (existing) {
            Object.assign(existing, item);
            created.push(existing);
          } else {
            const row: Product = {
              id: state.nextProductId++,
              created_at: new Date().toISOString(),
              slug: item.slug,
              name_en: item.name_en,
              name_fi: item.name_fi ?? "",
              desc_en: item.desc_en ?? "",
              desc_fi: item.desc_fi ?? "",
              price: Number(item.price),
              old_price: item.old_price === null ? null : Number(item.old_price),
              unit: item.unit ?? "",
              category: item.category ?? "asian",
              image: item.image ?? "",
              badge: item.badge ?? null,
              best_seller: Boolean(item.best_seller),
              stock: Number(item.stock ?? 25),
            };
            state.products.push(row);
            created.push(row);
          }
        }
        return new Response(
          JSON.stringify(prefer.includes("representation") ? created : []),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }
      if (table === "orders") {
        const row: Order = {
          id: state.nextOrderId++,
          created_at: new Date().toISOString(),
          order_no: body.order_no,
          customer_name: body.customer_name,
          phone: body.phone,
          email: body.email ?? null,
          method: body.method,
          address: body.address ?? null,
          city: body.city ?? null,
          postal_code: body.postal_code ?? null,
          notes: body.notes ?? null,
          items: body.items ?? [],
          subtotal: Number(body.subtotal ?? 0),
          delivery_fee: Number(body.delivery_fee ?? 0),
          total: Number(body.total ?? 0),
          status: body.status ?? "new",
        };
        state.orders.push(row);
        return new Response(JSON.stringify([]), { status: 201, headers: { "Content-Type": "application/json" } });
      }
    }

    if (method === "PATCH" || method === "DELETE") {
      const filtered = filterRows(rows as unknown as Record<string, unknown>[], params);
      const ids = new Set(filtered.map((r) => r.id));
      if (table === "products") {
        for (const p of state.products) {
          if (ids.has(p.id)) {
            if (method === "PATCH") Object.assign(p, body);
            else state.products = state.products.filter((x) => x.id !== p.id);
          }
        }
        return new Response(
          JSON.stringify(method === "PATCH" && prefer.includes("representation") ? state.products.filter((p) => ids.has(p.id)) : []),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (table === "orders") {
        for (const o of state.orders) {
          if (ids.has(o.id) && method === "PATCH") Object.assign(o, body);
          if (ids.has(o.id) && method === "DELETE") state.orders = state.orders.filter((x) => x.id !== o.id);
        }
        return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ message: "Method not supported" }), { status: 405 });
  },
});

console.log(`Mock PostgREST on http://localhost:${server.port}`);
