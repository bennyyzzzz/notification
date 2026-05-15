import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db"
});

const prisma = new PrismaClient({
  adapter
});

async function main() {
  const company = await prisma.company.upsert({
    where: {
      id: 1
    },
    update: {},
    create: {
      name: "Empresa Demo"
    }
  });

  await prisma.app.upsert({
    where: {
      id: 1
    },
    update: {},
    create: {
      companyId: company.id,
      name: "App Demo",
      platform: "firebase"
    }
  });

  console.log("Seed criado com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });