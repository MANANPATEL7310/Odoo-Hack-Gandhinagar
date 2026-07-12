/**
 * Development seed — creates realistic test data for the whole app.
 * Run with:  pnpm --filter @template/api exec tsx prisma/seed-dev.ts
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/hash.js";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding development data…");

  // ── Departments ─────────────────────────────────────────────────────────
  const [engDept, hrDept, itDept] = await Promise.all([
    prisma.department.upsert({
      where: { name: "Engineering" },
      update: {},
      create: { name: "Engineering", status: "ACTIVE" },
    }),
    prisma.department.upsert({
      where: { name: "Human Resources" },
      update: {},
      create: { name: "Human Resources", status: "ACTIVE" },
    }),
    prisma.department.upsert({
      where: { name: "IT Operations" },
      update: {},
      create: { name: "IT Operations", status: "ACTIVE" },
    }),
  ]);
  console.log(
    "✅ Departments created:",
    engDept.name,
    hrDept.name,
    itDept.name,
  );

  // ── Asset Categories ─────────────────────────────────────────────────────
  const [laptopCat, projectorCat, phoneCat] = await Promise.all([
    prisma.assetCategory.upsert({
      where: { name: "Laptop" },
      update: {},
      create: {
        name: "Laptop",
        description: "Portable computers",
        status: "ACTIVE",
      },
    }),
    prisma.assetCategory.upsert({
      where: { name: "Projector" },
      update: {},
      create: {
        name: "Projector",
        description: "Conference room projectors",
        status: "ACTIVE",
      },
    }),
    prisma.assetCategory.upsert({
      where: { name: "Mobile Phone" },
      update: {},
      create: {
        name: "Mobile Phone",
        description: "Company mobile devices",
        status: "ACTIVE",
      },
    }),
  ]);
  console.log("✅ Asset categories created");

  // ── Employees ────────────────────────────────────────────────────────────
  const passwordHash = await hashPassword("password123");

  const [admin, alice, bob, carol] = await Promise.all([
    prisma.employee.upsert({
      where: { email: "admin@acme.com" },
      update: { name: "System Admin", role: "ADMIN", passwordHash },
      create: {
        name: "System Admin",
        email: "admin@acme.com",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        departmentId: itDept.id,
      },
    }),
    prisma.employee.upsert({
      where: { email: "alice@acme.com" },
      update: { name: "Alice Smith", role: "ASSET_MANAGER", passwordHash },
      create: {
        name: "Alice Smith",
        email: "alice@acme.com",
        passwordHash,
        role: "ASSET_MANAGER",
        status: "ACTIVE",
        departmentId: engDept.id,
      },
    }),
    prisma.employee.upsert({
      where: { email: "bob@acme.com" },
      update: { name: "Bob Johnson", role: "DEPARTMENT_HEAD", passwordHash },
      create: {
        name: "Bob Johnson",
        email: "bob@acme.com",
        passwordHash,
        role: "DEPARTMENT_HEAD",
        status: "ACTIVE",
        departmentId: engDept.id,
      },
    }),
    prisma.employee.upsert({
      where: { email: "carol@acme.com" },
      update: { name: "Carol White", role: "EMPLOYEE", passwordHash },
      create: {
        name: "Carol White",
        email: "carol@acme.com",
        passwordHash,
        role: "EMPLOYEE",
        status: "ACTIVE",
        departmentId: hrDept.id,
      },
    }),
  ]);
  console.log(
    "✅ Employees created:",
    admin.email,
    alice.email,
    bob.email,
    carol.email,
  );

  // Ensure the asset_tag sequence exists
  await prisma.$executeRawUnsafe(
    `CREATE SEQUENCE IF NOT EXISTS asset_tag_seq;`,
  );

  // ── Assets ───────────────────────────────────────────────────────────────
  const assetTags = ["AST-001", "AST-002", "AST-003", "AST-004", "AST-005"];
  const assetDefs = [
    {
      assetTag: assetTags[0],
      name: 'MacBook Pro 16" (2023)',
      categoryId: laptopCat.id,
      serialNumber: "SN-MBA-001",
      status: "AVAILABLE" as const,
      isBookable: false,
      locationDepartmentId: engDept.id,
      condition: "Excellent",
      acquisitionDate: new Date("2023-01-15"),
      acquisitionCost: 2499,
    },
    {
      assetTag: assetTags[1],
      name: "Dell XPS 15 (2022)",
      categoryId: laptopCat.id,
      serialNumber: "SN-DEL-002",
      status: "AVAILABLE" as const,
      isBookable: false,
      locationDepartmentId: engDept.id,
      condition: "Good",
      acquisitionDate: new Date("2022-06-20"),
      acquisitionCost: 1899,
    },
    {
      assetTag: assetTags[2],
      name: "Epson EB-X51 Projector",
      categoryId: projectorCat.id,
      serialNumber: "SN-EPS-003",
      status: "AVAILABLE" as const,
      isBookable: true,
      locationDepartmentId: hrDept.id,
      condition: "Good",
      acquisitionDate: new Date("2021-03-10"),
      acquisitionCost: 599,
    },
    {
      assetTag: assetTags[3],
      name: "iPhone 14 Pro",
      categoryId: phoneCat.id,
      serialNumber: "SN-IPH-004",
      status: "ALLOCATED" as const,
      isBookable: false,
      locationDepartmentId: itDept.id,
      condition: "Excellent",
      acquisitionDate: new Date("2022-11-01"),
      acquisitionCost: 999,
    },
    {
      assetTag: assetTags[4],
      name: "Lenovo ThinkPad X1",
      categoryId: laptopCat.id,
      serialNumber: "SN-LNV-005",
      status: "UNDER_MAINTENANCE" as const,
      isBookable: false,
      locationDepartmentId: itDept.id,
      condition: "Fair",
      acquisitionDate: new Date("2020-08-15"),
      acquisitionCost: 1499,
    },
  ];

  const assets = [];
  for (const def of assetDefs) {
    const asset = await prisma.asset.upsert({
      where: { assetTag: def.assetTag },
      update: {},
      create: def,
    });
    assets.push(asset);
  }
  console.log("✅ Assets created:", assets.length);

  // ── Allocations ──────────────────────────────────────────────────────────
  // Asset[3] (iPhone 14 Pro) is ALLOCATED to carol
  const existingAlloc = await prisma.allocation.findFirst({
    where: { assetId: assets[3].id, returnedAt: null },
  });
  if (!existingAlloc) {
    await prisma.allocation.create({
      data: {
        assetId: assets[3].id,
        holderEmployeeId: carol.id,
        holderDepartmentId: hrDept.id,
        allocatedAt: new Date("2024-01-10"),
        expectedReturnDate: new Date("2024-12-31"),
        status: "ACTIVE",
      },
    });
    console.log("✅ Active allocation created for carol");
  }

  // ── Maintenance Request ──────────────────────────────────────────────────
  // Asset[4] (Lenovo ThinkPad) has a maintenance request
  const existingMR = await prisma.maintenanceRequest.findFirst({
    where: { assetId: assets[4].id },
  });
  if (!existingMR) {
    await prisma.maintenanceRequest.create({
      data: {
        assetId: assets[4].id,
        raisedByEmployeeId: bob.id,
        issueDescription: "Screen flickering and random shutdowns",
        priority: "HIGH",
        status: "IN_PROGRESS",
        decidedByEmployeeId: alice.id,
        decidedAt: new Date(),
      },
    });
    console.log("✅ Maintenance request created");
  }

  // ── Booking ──────────────────────────────────────────────────────────────
  // Asset[2] (Projector) is bookable — create an upcoming booking
  const existingBooking = await prisma.booking.findFirst({
    where: { resourceAssetId: assets[2].id, status: "UPCOMING" },
  });
  if (!existingBooking) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);

    await prisma.booking.create({
      data: {
        resourceAssetId: assets[2].id,
        bookedByEmployeeId: carol.id,
        startTime: tomorrow,
        endTime: tomorrowEnd,
        status: "UPCOMING",
      },
    });
    console.log("✅ Upcoming booking created");
  }

  // ── Ensure partial unique index for allocations ──────────────────────────
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Allocation_assetId_returnedAt_null_idx"
    ON "Allocation"("assetId")
    WHERE "returnedAt" IS NULL;
  `);

  console.log("\n🎉 Development seed complete!");
  console.log("─────────────────────────────────────");
  console.log("Login credentials (all use password123):");
  console.log("  admin@acme.com     → ADMIN");
  console.log("  alice@acme.com     → ASSET_MANAGER");
  console.log("  bob@acme.com       → DEPARTMENT_HEAD");
  console.log("  carol@acme.com     → EMPLOYEE");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
