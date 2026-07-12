import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/hash.js";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

async function main() {
  // Ensure the database-level partial unique index exists to enforce that an asset can only have one active allocation
  console.log(
    "Ensuring partial unique index on Allocation(assetId) WHERE returnedAt IS NULL exists...",
  );
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Allocation_assetId_returnedAt_null_idx"
    ON "Allocation"("assetId")
    WHERE "returnedAt" IS NULL;
  `);

  const email = process.env.INITIAL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.INITIAL_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "changeme123";

  console.log(`Seeding bootstrap admin user: ${email}...`);

  const passwordHash = await hashPassword(password);

  await prisma.employee.upsert({
    where: { email },
    update: {
      name: "System Admin",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      email,
      name: "System Admin",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
