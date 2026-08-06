import { prisma } from "@/lib/db";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  href?: string
) {
  return prisma.notification.create({
    data: { userId, title, message, href: href ?? null },
  });
}

export async function notifyStudent(studentId: string, title: string, message: string, href?: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { userId: true },
  });
  if (!student) return;
  await createNotification(student.userId, title, message, href);
}

export async function notifyStudentParents(studentId: string, title: string, message: string, href?: string) {
  const links = await prisma.parentStudent.findMany({
    where: { studentId },
    select: { parentId: true },
  });
  for (const link of links) {
    await createNotification(link.parentId, title, message, href);
  }
}
