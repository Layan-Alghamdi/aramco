import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = `admin@${process.env.COMPANY_DOMAIN || 'adc.com'}`;
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, name: 'Admin' },
    create: { email: adminEmail, role: Role.ADMIN, name: 'Admin' }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

