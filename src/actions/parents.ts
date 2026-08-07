"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createParentAction(formData: FormData) {
  const user = await requireSession(["admin", "director"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "demo123");
  const studentId = String(formData.get("studentId") ?? "") || null;
  const relation = String(formData.get("relation") ?? "responsavel");

  if (!fullName || !email) return { error: "Nome e e-mail são obrigatórios." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "E-mail já cadastrado." };

  const passwordHash = await bcrypt.hash(password, 10);
  const parent = await prisma.user.create({
    data: { email, passwordHash, fullName, role: "parent", schoolId: user.schoolId },
  });

  if (studentId) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, user: { schoolId: user.schoolId } },
    });
    if (student) {
      await prisma.parentStudent.create({
        data: { parentId: parent.id, studentId, relation },
      });
    }
  }

  revalidateParentPaths();
  return { success: true };
}

export async function linkParentStudentAction(formData: FormData) {
  const user = await requireSession(["admin", "director"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const parentId = String(formData.get("parentId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const relation = String(formData.get("relation") ?? "responsavel");

  const parent = await prisma.user.findFirst({
    where: { id: parentId, schoolId: user.schoolId, role: "parent" },
  });
  const student = await prisma.student.findFirst({
    where: { id: studentId, user: { schoolId: user.schoolId } },
  });

  if (!parent || !student) return { error: "Responsável ou aluno não encontrado." };

  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId, studentId } },
    create: { parentId, studentId, relation },
    update: { relation },
  });

  revalidateParentPaths();
  return { success: true };
}

export async function unlinkParentStudentAction(formData: FormData) {
  const user = await requireSession(["admin", "director"]);
  const linkId = String(formData.get("linkId") ?? "");

  const link = await prisma.parentStudent.findFirst({
    where: { id: linkId, parent: { schoolId: user.schoolId } },
  });
  if (!link) return { error: "Vínculo não encontrado." };

  await prisma.parentStudent.delete({ where: { id: linkId } });
  revalidateParentPaths();
  return { success: true };
}

function revalidateParentPaths() {
  ["/dashboard/responsaveis", "/dashboard/responsavel"].forEach((p) => revalidatePath(p));
}

export async function getParentsForSchool(schoolId: string | null) {
  if (!schoolId) return [];

  const parents = await prisma.user.findMany({
    where: { schoolId, role: "parent" },
    orderBy: { fullName: "asc" },
  });

  if (parents.length === 0) return [];

  const links = await prisma.parentStudent.findMany({
    where: { parentId: { in: parents.map((p) => p.id) } },
    include: {
      student: {
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
          classGroup: true,
        },
      },
    },
  });

  const linksByParent = new Map<string, typeof links>();
  for (const link of links) {
    const group = linksByParent.get(link.parentId) ?? [];
    group.push(link);
    linksByParent.set(link.parentId, group);
  }

  return parents.map((parent) => ({
    ...parent,
    parentLinks: linksByParent.get(parent.id) ?? [],
  }));
}

export async function getParentChildren(parentId: string) {
  return prisma.parentStudent.findMany({
    where: { parentId },
    include: {
      student: {
        include: {
          user: true,
          classGroup: true,
          grades: { orderBy: { createdAt: "desc" }, take: 10 },
          attendance: { orderBy: { date: "desc" }, take: 10 },
          studentBadges: { include: { badge: true } },
          rewardRedemptions: { include: { reward: true }, orderBy: { redeemedAt: "desc" }, take: 5 },
        },
      },
    },
  });
}

export async function getChildForParent(parentId: string, studentId: string) {
  const link = await prisma.parentStudent.findFirst({
    where: { parentId, studentId },
    include: {
      student: {
        include: {
          user: true,
          classGroup: true,
          grades: { orderBy: { createdAt: "desc" } },
          attendance: { orderBy: { date: "desc" }, take: 30 },
          xpTransactions: { orderBy: { createdAt: "desc" }, take: 15 },
          studentMissions: { include: { mission: true } },
          studentBadges: { include: { badge: true } },
          rewardRedemptions: { include: { reward: true }, orderBy: { redeemedAt: "desc" } },
        },
      },
    },
  });
  return link;
}
