import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all application data...');

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "invoice_line_items",
      "invoices",
      "inventory_transactions",
      "payments",
      "bookings",
      "follow_ups",
      "events",
      "enquiries",
      "customers",
      "inventory",
      "vendors",
      "refresh_tokens",
      "users",
      "vendor_categories"
    RESTART IDENTITY CASCADE;
  `);

  console.log('Database cleared completely.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
