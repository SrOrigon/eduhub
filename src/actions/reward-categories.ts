"use server";

import { revalidatePath } from "next/cache";
import { requireSessionResult } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSchoolSettings } from "@/lib/school-settings";
import { hasPermission } from "@/lib/permissions";

function revalidateShop() {
  ["/dashboard/loja", "/dashboard/gamificacao"].forEach((p) => revalidatePath(p));
}

function manageRewardsError(user: { role: string; schoolId: string | null }) {
  if (!user.schoolId) return "Escola não configurada.";
  return null;
}

async function checkDirectorManageRewards(user: { role: string; schoolId: string | null }) {
  const base = manageRewardsError(user);
  if (base) return base;
  const settings = await getSchoolSettings(user.schoolId);
  if (user.role === "director" && !hasPermission(user.role, settings, "director.manageRewards")) {
    return "Sem permissão para gerenciar a loja.";
  }
  return null;
}

export async function getRewardCategoriesForSchool(schoolId: string | null) {
  if (!schoolId) return [];
  return prisma.rewardCategory.findMany({
    where: { schoolId },
    include: { _count: { select: { rewards: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createRewardCategoryAction(formData: FormData) {
  const session = await requireSessionResult(["admin", "director"]);
  if (!session.ok) return { error: session.error };
  const user = session.user;

  const permError = await checkDirectorManageRewards(user);
  if (permError) return { error: permError };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);

  if (!name) return { error: "Informe o nome da categoria." };

  const existing = await prisma.rewardCategory.findFirst({
    where: { schoolId: user.schoolId!, name },
  });
  if (existing) return { error: "Já existe uma categoria com este nome." };

  await prisma.rewardCategory.create({
    data: {
      schoolId: user.schoolId!,
      name,
      description: description || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  revalidateShop();
  return { success: true };
}

export async function updateRewardCategoryAction(formData: FormData) {
  const session = await requireSessionResult(["admin", "director"]);
  if (!session.ok) return { error: session.error };
  const user = session.user;

  const permError = await checkDirectorManageRewards(user);
  if (permError) return { error: permError };

  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);

  if (!categoryId || !name) return { error: "Dados inválidos." };

  const category = await prisma.rewardCategory.findFirst({
    where: { id: categoryId, schoolId: user.schoolId! },
  });
  if (!category) return { error: "Categoria não encontrada." };

  const duplicate = await prisma.rewardCategory.findFirst({
    where: { schoolId: user.schoolId!, name, NOT: { id: categoryId } },
  });
  if (duplicate) return { error: "Já existe outra categoria com este nome." };

  await prisma.rewardCategory.update({
    where: { id: categoryId },
    data: {
      name,
      description: description || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : category.sortOrder,
    },
  });

  revalidateShop();
  return { success: true };
}

export async function toggleRewardCategoryAction(formData: FormData) {
  const session = await requireSessionResult(["admin", "director"]);
  if (!session.ok) return { error: session.error };
  const user = session.user;

  const permError = await checkDirectorManageRewards(user);
  if (permError) return { error: permError };

  const categoryId = String(formData.get("categoryId") ?? "");
  const category = await prisma.rewardCategory.findFirst({
    where: { id: categoryId, schoolId: user.schoolId! },
  });
  if (!category) return { error: "Categoria não encontrada." };

  await prisma.rewardCategory.update({
    where: { id: categoryId },
    data: { isActive: !category.isActive },
  });

  revalidateShop();
  return { success: true };
}

export async function deleteRewardCategoryAction(formData: FormData) {
  const session = await requireSessionResult(["admin", "director"]);
  if (!session.ok) return { error: session.error };
  const user = session.user;

  const permError = await checkDirectorManageRewards(user);
  if (permError) return { error: permError };

  const categoryId = String(formData.get("categoryId") ?? "");
  const category = await prisma.rewardCategory.findFirst({
    where: { id: categoryId, schoolId: user.schoolId! },
    include: { _count: { select: { rewards: true } } },
  });
  if (!category) return { error: "Categoria não encontrada." };

  if (category._count.rewards > 0) {
    await prisma.rewardCategory.update({
      where: { id: categoryId },
      data: { isActive: false },
    });
    revalidateShop();
    return {
      success: true,
      message: "Categoria desativada (ainda possui itens vinculados).",
    };
  }

  await prisma.rewardCategory.delete({ where: { id: categoryId } });
  revalidateShop();
  return { success: true };
}
