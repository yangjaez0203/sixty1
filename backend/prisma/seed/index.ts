import { PrismaClient } from '@prisma/client';

async function seed(prisma?: PrismaClient) {
  const client = prisma ?? new PrismaClient();

  await client.$transaction(async (tx) => {
    // seed data here
  });

  if (!prisma) await client.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
