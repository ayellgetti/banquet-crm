import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

const VENDOR_CATEGORIES = [
  'Decoration',
  'Photography',
  'DJ',
  'Catering',
  'Florist',
  'Sound System',
  'Lighting',
  'Security',
  'Housekeeping',
  'Water Supplier',
];

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { username: '9999999999' },
    update: {},
    create: {
      username: '9999999999',
      firstName: 'Admin',
      lastName: 'User',
      dob: new Date('1990-01-01'),
      mobileNo: '9999999999',
      email: 'admin@banquet.com',
      role: UserRole.ADMIN,
      passwordHash,
    },
  });

  console.log(`Admin user: ${admin.username}`);

  for (const categoryName of VENDOR_CATEGORIES) {
    await prisma.vendorCategory.upsert({
      where: { categoryName },
      update: {},
      create: { categoryName },
    });
  }

  console.log(`Vendor categories: ${VENDOR_CATEGORIES.length}`);
  console.log('Seed completed (admin + vendor categories only).');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
