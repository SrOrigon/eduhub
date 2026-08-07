"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireSessionResult } from "@/lib/auth";
import { prisma } from "@/lib/db";

function revalidateProfile() {
  revalidatePath("/dashboard/perfil");
  revalidatePath("/dashboard", "layout");
  ["/dashboard/aluno", "/dashboard/responsavel", "/dashboard/professor"].forEach((p) =>
    revalidatePath(p)
  );
}

export async function getProfileData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      school: { select: { name: true, slug: true, city: true, state: true } },
      student: {
        select: {
          id: true,
          enrollmentCode: true,
          level: true,
          xpTotal: true,
          coins: true,
          classGroup: { select: { name: true } },
        },
      },
      parentLinks: {
        select: {
          relation: true,
          student: {
            select: {
              id: true,
              user: { select: { fullName: true } },
              classGroup: { select: { name: true } },
            },
          },
        },
      },
      taughtClasses: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      _count: {
        select: {
          notifications: true,
          parentLinks: true,
          taughtClasses: true,
        },
      },
    },
  });
}

export async function updateProfileAction(formData: FormData) {
  const session = await requireSessionResult();
  if (!session.ok) return { error: session.error };
  const user = session.user;

  const fullName = String(formData.get("fullName") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;

  if (!fullName || fullName.length < 2) {
    return { error: "Informe seu nome completo (mínimo 2 caracteres)." };
  }

  if (avatarUrl && !/^https?:\/\/.+/i.test(avatarUrl)) {
    return { error: "URL da foto deve começar com http:// ou https://" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { fullName, avatarUrl },
  });

  revalidateProfile();
  return { success: true, message: "Perfil atualizado com sucesso." };
}

export async function changePasswordAction(formData: FormData) {
  const session = await requireSessionResult();
  if (!session.ok) return { error: session.error };
  const user = session.user;

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Preencha todos os campos de senha." };
  }
  if (newPassword.length < 6) {
    return { error: "A nova senha deve ter pelo menos 6 caracteres." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "A confirmação da nova senha não confere." };
  }
  if (currentPassword === newPassword) {
    return { error: "A nova senha deve ser diferente da atual." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!dbUser) return { error: "Usuário não encontrado." };

  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!valid) return { error: "Senha atual incorreta." };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  revalidateProfile();
  return { success: true, message: "Senha alterada com sucesso." };
}
