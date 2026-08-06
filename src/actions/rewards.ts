"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyStudent, notifyStudentParents } from "@/lib/notifications";

function revalidateLoja() {
  ["/dashboard/loja", "/dashboard/aluno", "/dashboard/gamificacao", "/dashboard/notificacoes"].forEach((p) =>
    revalidatePath(p)
  );
}

export async function createRewardAction(formData: FormData) {
  const user = await requireSession(["admin", "director"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const coinCost = parseInt(String(formData.get("coinCost") ?? "0"), 10);
  const stockStr = String(formData.get("stock") ?? "").trim();
  const stock = stockStr ? parseInt(stockStr, 10) : null;

  if (!name || coinCost <= 0) return { error: "Nome e custo em moedas são obrigatórios." };

  await prisma.reward.create({
    data: {
      schoolId: user.schoolId,
      name,
      description: description || null,
      coinCost,
      stock: stock && stock > 0 ? stock : null,
      isActive: true,
    },
  });

  revalidateLoja();
  return { success: true };
}

export async function toggleRewardAction(formData: FormData) {
  const user = await requireSession(["admin", "director"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const rewardId = String(formData.get("rewardId") ?? "");
  const reward = await prisma.reward.findFirst({
    where: { id: rewardId, schoolId: user.schoolId },
  });
  if (!reward) return { error: "Recompensa não encontrada." };

  await prisma.reward.update({
    where: { id: rewardId },
    data: { isActive: !reward.isActive },
  });

  revalidateLoja();
  return { success: true };
}

export async function redeemRewardAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher", "student"]);
  const rewardId = String(formData.get("rewardId") ?? "");
  let studentId = String(formData.get("studentId") ?? "");

  if (user.role === "student") {
    const st = await prisma.student.findFirst({ where: { userId: user.id } });
    if (!st) return { error: "Perfil de aluno não encontrado." };
    studentId = st.id;
  }

  if (!rewardId || !studentId) return { error: "Dados inválidos." };

  const [reward, student] = await Promise.all([
    prisma.reward.findFirst({
      where: { id: rewardId, isActive: true, schoolId: user.schoolId ?? undefined },
    }),
    prisma.student.findFirst({
      where: { id: studentId, user: { schoolId: user.schoolId } },
    }),
  ]);

  if (!reward) return { error: "Recompensa indisponível." };
  if (!student) return { error: "Aluno não encontrado." };
  if (student.coins < reward.coinCost) {
    return { error: `Moedas insuficientes. Você tem ${student.coins}, precisa de ${reward.coinCost}.` };
  }

  if (reward.stock !== null && reward.stock <= 0) {
    return { error: "Recompensa esgotada." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.student.update({
      where: { id: studentId },
      data: { coins: { decrement: reward.coinCost } },
    });

    await tx.rewardRedemption.create({
      data: { studentId, rewardId, coinCost: reward.coinCost },
    });

    if (reward.stock !== null) {
      await tx.reward.update({
        where: { id: rewardId },
        data: { stock: { decrement: 1 } },
      });
    }
  });

  await notifyStudent(
    studentId,
    "Resgate confirmado!",
    `Você resgatou: ${reward.name} (-${reward.coinCost} moedas)`,
    "/dashboard/loja"
  );
  await notifyStudentParents(
    studentId,
    "Resgate na loja",
    `Resgate: ${reward.name} (${reward.coinCost} moedas)`,
    `/dashboard/responsavel/filho/${studentId}`
  );

  revalidateLoja();
  return { success: true, message: `Resgate confirmado: ${reward.name}!` };
}

export async function getRewardsForSchool(schoolId: string | null) {
  if (!schoolId) return [];
  return prisma.reward.findMany({
    where: { schoolId },
    include: { _count: { select: { redemptions: true } } },
    orderBy: { coinCost: "asc" },
  });
}

export async function getStudentRedemptions(studentId: string) {
  return prisma.rewardRedemption.findMany({
    where: { studentId },
    include: { reward: true },
    orderBy: { redeemedAt: "desc" },
    take: 20,
  });
}
