import process from "process";
import { PrismaClient, Role, EmployeeStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto.js";

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

  const email = process.env.ADMIN_EMAIL || "admin@assetflow.com";
  const password = process.env.ADMIN_PASSWORD || "adminpassword123";

  console.log(`Bootstrapping admin account checking: ${email}`);

  const existingAdmin = await prisma.employee.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`Admin account with email ${email} already exists.`);
    return;
  }

  const passwordHash = hashPassword(password);

  await prisma.employee.create({
    data: {
      name: "System Admin",
      email,
      passwordHash,
      role: Role.ADMIN,
      status: EmployeeStatus.ACTIVE,
    },
  });

  console.log(`Successfully bootstrapped initial admin account: ${email}`);
}

main()
  .catch((e) => {
    console.error("Error during admin bootstrapping seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
