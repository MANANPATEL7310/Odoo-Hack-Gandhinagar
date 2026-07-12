import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/hash.js";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.INITIAL_ADMIN_PASSWORD || "changeme123";

  console.log(`Seeding bootstrap admin user: ${email}...`);

  const passwordHash = await hashPassword(password);

  await prisma.employee.upsert({
    where: { email },
    update: {
      name: "Admin Builder",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      email,
      name: "Admin Builder",
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
