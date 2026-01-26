import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding database...');

  // Super Admin yaratamiz
  const superAdminEmail = 'admin@lms.com';
  const superAdminPhone = '+998901112233';
  const superAdminPassword = await bcrypt.hash('Admin@12345', 10);

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: superAdminEmail }, { phone: superAdminPhone }],
    },
  });

  if (existingAdmin) {
    console.log(' Super Admin allaqachon mavjud');
  } else {
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        phone: superAdminPhone,
        password: superAdminPassword,
        fullName: 'Super Admin',
        role: UserRole.ADMIN,
      },
    });

    console.log('✅ Super Admin yaratildi:');
    console.log(`   📧 Email: ${superAdminEmail}`);
    console.log(`   📱 Phone: ${superAdminPhone}`);
    console.log(`   🔑 Password: Admin@12345`);
    console.log(`   🆔 User ID: ${superAdmin.id}`);
  }

  console.log('✨ Seeding tugadi!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding xatosi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
