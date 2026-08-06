import { prisma } from "@/lib/db";
import type { XpSource } from "@/lib/constants";

const XP_PER_GRADE_POINT = 5;
const XP_ATTENDANCE_PRESENT = 10;
const XP_ATTENDANCE_LATE = 5;
const XP_GRADE_BONUS_THRESHOLD = 9;
const XP_GRADE_BONUS = 50;
const COINS_PER_MISSION = 1;

function calculateLevel(xpTotal: number) {
  return Math.max(1, Math.floor(xpTotal / 300) + 1);
}

export function getXpProgress(xpTotal: number) {
  const xpInLevel = xpTotal % 300;
  const percent = Math.round((xpInLevel / 300) * 100);
  const level = calculateLevel(xpTotal);
  const xpForNextLevel = level * 300;
  return { percent, xpInLevel, xpForNextLevel, level };
}

export { calculateLevel };

export async function awardXp(
  studentId: string,
  amount: number,
  reason: string,
  source: XpSource,
  coins = 0
) {
  if (amount <= 0 && coins <= 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.xpTransaction.create({
      data: { studentId, amount, reason, source },
    });

    const student = await tx.student.update({
      where: { id: studentId },
      data: {
        xpTotal: { increment: amount },
        coins: { increment: coins },
      },
    });

    const newLevel = calculateLevel(student.xpTotal + amount);
    if (newLevel !== student.level) {
      await tx.student.update({
        where: { id: studentId },
        data: { level: newLevel },
      });
    }

    await checkAndAwardBadges(tx, studentId, student.xpTotal + amount);
  });
}

async function checkAndAwardBadges(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  studentId: string,
  xpTotal: number
) {
  const student = await tx.student.findUnique({
    where: { id: studentId },
    include: { user: true, studentBadges: true, grades: true, studentMissions: true },
  });
  if (!student?.user.schoolId) return;

  const badges = await tx.badge.findMany({ where: { schoolId: student.user.schoolId } });
  const earnedIds = new Set(student.studentBadges.map((b) => b.badgeId));

  const avgGrade =
    student.grades.length > 0
      ? student.grades.reduce((s, g) => s + g.value, 0) / student.grades.length
      : 0;
  const completedMissions = student.studentMissions.filter((m) => m.completedAt).length;

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue;

    let earned = false;
    if (badge.icon === "star" && avgGrade >= 9) earned = true;
    if (badge.icon === "target" && completedMissions >= 5) earned = true;
    if (badge.icon === "clock" && xpTotal >= badge.xpRequired) earned = true;
    if (xpTotal >= badge.xpRequired && badge.icon !== "star" && badge.icon !== "target")
      earned = true;

    if (earned) {
      await tx.studentBadge.create({ data: { studentId, badgeId: badge.id } });
      await tx.xpTransaction.create({
        data: {
          studentId,
          amount: 25,
          reason: `Conquista desbloqueada: ${badge.name}`,
          source: "badge",
        },
      });
      await tx.student.update({
        where: { id: studentId },
        data: { xpTotal: { increment: 25 } },
      });
    }
  }
}

export async function processGradeXp(studentId: string, value: number, subject: string) {
  const baseXp = Math.round(value * XP_PER_GRADE_POINT);
  let bonus = 0;
  if (value >= XP_GRADE_BONUS_THRESHOLD) bonus = XP_GRADE_BONUS;

  await awardXp(
    studentId,
    baseXp + bonus,
    bonus > 0 ? `Nota ${value} em ${subject} (+ bônus)` : `Nota ${value} em ${subject}`,
    "grade"
  );
}

export async function processAttendanceXp(studentId: string, status: string) {
  if (status === "present") {
    await awardXp(studentId, XP_ATTENDANCE_PRESENT, "Presença registrada", "attendance");
  } else if (status === "late") {
    await awardXp(studentId, XP_ATTENDANCE_LATE, "Presença com atraso", "attendance");
  }
}

export async function completeMission(studentId: string, missionId: string) {
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) throw new Error("Missão não encontrada");

  const existing = await prisma.studentMission.findUnique({
    where: { studentId_missionId: { studentId, missionId } },
  });
  if (existing?.completedAt) throw new Error("Missão já concluída");

  await prisma.studentMission.upsert({
    where: { studentId_missionId: { studentId, missionId } },
    create: { studentId, missionId, completedAt: new Date() },
    update: { completedAt: new Date() },
  });

  await awardXp(
    studentId,
    mission.xpReward,
    `Missão: ${mission.title}`,
    "mission",
    mission.coinReward
  );
}
