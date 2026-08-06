import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

run("npx prisma migrate deploy");

const prisma = new PrismaClient();
try {
  const users = await prisma.user.count();
  if (users === 0) {
    console.log("[eduhub] Banco vazio — populando contas demo...");
    run("npx tsx prisma/seed.ts");
    console.log("[eduhub] Seed concluído.");
  }
} finally {
  await prisma.$disconnect();
}

run("npx next start");
