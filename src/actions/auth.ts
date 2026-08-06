"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  clearSessionCookie,
  setSessionCookie,
  requireSession,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDefaultBadges, ensureDefaultRewards } from "@/lib/school-setup";
import type { UserRole } from "@/lib/constants";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "E-mail ou senha inválidos." };
  }

  const token = await createSessionToken(user.id);
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const role = String(formData.get("role") ?? "director") as UserRole;
  const schoolName = String(formData.get("schoolName") ?? "").trim();

  if (!email || !password || !fullName) {
    return { error: "Preencha todos os campos obrigatórios." };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Este e-mail já está cadastrado." };

  const passwordHash = await bcrypt.hash(password, 10);

  let schoolId: string | undefined;
  if (schoolName) {
    const slug = schoolName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const school = await prisma.school.create({
      data: { name: schoolName, slug: `${slug}-${Date.now()}` },
    });
    schoolId = school.id;
    await ensureDefaultBadges(school.id);
    await ensureDefaultRewards(school.id);
  }

  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, role, schoolId },
  });

  const token = await createSessionToken(user.id);
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function getCurrentUserAction() {
  return requireSession().catch(() => null);
}
