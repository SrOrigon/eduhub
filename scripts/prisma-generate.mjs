import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./.prisma-build.db";
}

execSync("npx prisma generate", { stdio: "inherit" });
