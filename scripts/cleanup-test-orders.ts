import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const orders = await db.order.findMany({
    where: { customerName: { contains: "Test" } },
    orderBy: { id: "desc" },
    take: 5,
  });
  console.log(
    "recent test orders:",
    orders.map((o) => `${o.orderNo} ${o.total}€ ${o.method}`).join(", ") || "none"
  );
  const deleted = await db.order.deleteMany({
    where: { customerName: { contains: "Test" } },
  });
  console.log(`deleted ${deleted.count} test order(s). remaining orders:`, await db.order.count());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
