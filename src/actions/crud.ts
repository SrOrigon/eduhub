"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { processGradeXp, processAttendanceXp, completeMission } from "@/lib/gamification";
import {
  notifyStudent,
  notifyStudentParents,
  notifyClassTeacher,
  notifyUser,
} from "@/lib/notifications";
import { ATTENDANCE_LABELS, type AttendanceStatus } from "@/lib/constants";
import {
  getSchoolSettings,
  mergeSchoolSettings,
  parseSchoolSettings,
  stringifySchoolSettings,
  type SchoolSettings,
} from "@/lib/school-settings";

function revalidateAll() {
  [
    "/dashboard",
    "/dashboard/alunos",
    "/dashboard/turmas",
    "/dashboard/notas",
    "/dashboard/frequencia",
    "/dashboard/gamificacao",
    "/dashboard/relatorios",
    "/dashboard/notificacoes",
    "/dashboard/aluno",
  ].forEach((p) => revalidatePath(p));
}

export async function createStudentAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const enrollmentCode = String(formData.get("enrollmentCode") ?? "").trim();
  const classId = String(formData.get("classId") ?? "") || null;
  const password = String(formData.get("password") ?? "demo123");

  if (!fullName || !email || !enrollmentCode) {
    return { error: "Nome, e-mail e matrícula são obrigatórios." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "E-mail já cadastrado." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: "student",
      schoolId: user.schoolId,
      student: {
        create: { enrollmentCode, classId },
      },
    },
  });

  revalidateAll();
  return { success: true };
}

export async function createClassAction(formData: FormData) {
  const user = await requireSession(["admin", "director"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const name = String(formData.get("name") ?? "").trim();
  const gradeLevel = String(formData.get("gradeLevel") ?? "").trim();
  const year = parseInt(String(formData.get("year") ?? "2026"), 10);
  const teacherId = String(formData.get("teacherId") ?? "") || null;

  if (!name || !gradeLevel) return { error: "Nome e série são obrigatórios." };

  await prisma.classGroup.create({
    data: { schoolId: user.schoolId, name, gradeLevel, year, teacherId },
  });

  revalidateAll();
  return { success: true };
}

export async function createGradeAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const settings = await getSchoolSettings(user.schoolId);
  const studentId = String(formData.get("studentId") ?? "");
  const subject = String(formData.get("subject") ?? "");
  const value = parseFloat(String(formData.get("value") ?? "0"));
  const period = String(formData.get("period") ?? settings.academic.periods[0] ?? "1º Bimestre");
  const maxGrade = settings.academic.maxGrade;

  if (!studentId || !subject || isNaN(value)) {
    return { error: "Preencha todos os campos." };
  }
  if (value < 0 || value > maxGrade) {
    return { error: `Nota deve ser entre 0 e ${maxGrade}.` };
  }

  const student = await prisma.student.findFirst({
    where: { id: studentId, user: { schoolId: user.schoolId } },
  });
  if (!student) return { error: "Aluno não encontrado." };

  await prisma.grade.create({
    data: {
      studentId,
      subject,
      value,
      period,
      teacherId: user.role === "teacher" ? user.id : undefined,
    },
  });

  await processGradeXp(studentId, value, subject);

  await notifyStudent(
    studentId,
    "Nova nota lançada",
    `${subject}: ${value.toFixed(1)} (${period})`,
    "/dashboard/aluno"
  );
  await notifyStudentParents(
    studentId,
    "Nota do filho(a)",
    `${subject}: ${value.toFixed(1)} (${period})`,
    `/dashboard/responsavel/filho/${studentId}`,
    "grade"
  );

  revalidateAll();
  return { success: true };
}

export async function recordAttendanceAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const studentId = String(formData.get("studentId") ?? "");
  const classId = String(formData.get("classId") ?? "");
  const status = String(formData.get("status") ?? "present");
  const dateStr = String(formData.get("date") ?? new Date().toISOString().split("T")[0]);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  if (!studentId || !classId) return { error: "Aluno e turma são obrigatórios." };

  const existing = await prisma.attendance.findUnique({
    where: { studentId_date: { studentId, date } },
  });

  const previousStatus = existing?.status ?? null;
  if (existing) {
    await prisma.attendance.update({
      where: { id: existing.id },
      data: { status },
    });
  } else {
    await prisma.attendance.create({
      data: { studentId, classId, date, status },
    });
  }

  if (previousStatus !== status) {
    await processAttendanceXp(studentId, status, previousStatus);
  }

  if (
    (status === "absent" || status === "late") &&
    previousStatus !== status
  ) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { fullName: true } } },
    });
    const label = ATTENDANCE_LABELS[status as AttendanceStatus] ?? status;
    const when = date.toLocaleDateString("pt-BR");
    if (student) {
      await notifyStudentParents(
        studentId,
        status === "absent" ? "Falta registrada" : "Atraso registrado",
        `${student.user.fullName}: ${label} em ${when}`,
        `/dashboard/responsavel/filho/${studentId}`,
        "absence"
      );
      if (status === "absent") {
        await notifyStudent(
          studentId,
          "Falta registrada",
          `Falta em ${when}. Fale com a secretaria se houver justificativa.`,
          "/dashboard/aluno",
          "absence"
        );
      }
    }
  }

  revalidateAll();
  return { success: true };
}

export async function createMissionAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const settings = await getSchoolSettings(user.schoolId);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const xpReward = parseInt(
    String(formData.get("xpReward") ?? String(settings.missions.defaultXp)),
    10
  );
  const coinReward = parseInt(
    String(formData.get("coinReward") ?? String(settings.missions.defaultCoins)),
    10
  );
  const classId = String(formData.get("classId") ?? "") || null;
  const dueDateStr = String(formData.get("dueDate") ?? "");

  if (!title) return { error: "Título é obrigatório." };

  const mission = await prisma.mission.create({
    data: {
      schoolId: user.schoolId,
      title,
      description,
      xpReward,
      coinReward,
      classId,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      isActive: true,
    },
  });

  if (classId) {
    const classStudents = await prisma.student.findMany({
      where: { classId },
      select: { id: true },
    });
    for (const s of classStudents) {
      await notifyStudent(
        s.id,
        "Nova missão disponível",
        mission.title,
        "/dashboard/aluno"
      );
    }
  }

  revalidateAll();
  return { success: true };
}

export async function updateMissionAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const missionId = String(formData.get("missionId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const xpReward = parseInt(String(formData.get("xpReward") ?? "100"), 10);
  const coinReward = parseInt(String(formData.get("coinReward") ?? "30"), 10);
  const classId = String(formData.get("classId") ?? "") || null;
  const dueDateStr = String(formData.get("dueDate") ?? "");

  if (!missionId || !title) return { error: "Dados inválidos." };

  const mission = await prisma.mission.findFirst({
    where: { id: missionId, schoolId: user.schoolId },
  });
  if (!mission) return { error: "Missão não encontrada." };

  await prisma.mission.update({
    where: { id: missionId },
    data: {
      title,
      description: description || null,
      xpReward,
      coinReward,
      classId,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
    },
  });

  revalidateAll();
  return { success: true };
}

export async function toggleMissionAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher"]);
  if (!user.schoolId) return { error: "Escola não configurada." };
  const missionId = String(formData.get("missionId") ?? "");

  const mission = await prisma.mission.findFirst({
    where: { id: missionId, schoolId: user.schoolId },
  });
  if (!mission) return { error: "Missão não encontrada." };

  await prisma.mission.update({
    where: { id: missionId },
    data: { isActive: !mission.isActive },
  });

  revalidateAll();
  return { success: true };
}

export async function completeMissionAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher"]);
  const studentId = String(formData.get("studentId") ?? "");
  const missionId = String(formData.get("missionId") ?? "");

  if (!studentId || !missionId) return { error: "Dados inválidos." };

  const student = await prisma.student.findFirst({
    where: { id: studentId, user: { schoolId: user.schoolId } },
  });
  if (!student) return { error: "Aluno não encontrado." };

  try {
    const mission = await prisma.mission.findUnique({ where: { id: missionId } });
    await completeMission(studentId, missionId);

    if (mission) {
      await notifyStudent(
        studentId,
        "Missão concluída!",
        `Você ganhou ${mission.xpReward} XP e ${mission.coinReward} moedas em "${mission.title}".`,
        "/dashboard/aluno"
      );
      await notifyStudentParents(
        studentId,
        "Missão concluída",
        `Missão "${mission.title}" foi concluída.`,
        `/dashboard/responsavel/filho/${studentId}`,
        "mission"
      );
    }

    revalidateAll();
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao concluir missão." };
  }
}

export async function bulkAttendanceAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const classId = String(formData.get("classId") ?? "");
  const dateStr = String(formData.get("date") ?? new Date().toISOString().split("T")[0]);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  if (!classId) return { error: "Selecione uma turma." };

  const students = await prisma.student.findMany({
    where: { classId, user: { schoolId: user.schoolId } },
  });

  if (students.length === 0) return { error: "Nenhum aluno nesta turma." };

  let registered = 0;
  for (const student of students) {
    const status = String(formData.get(`status_${student.id}`) ?? "present");
    const existing = await prisma.attendance.findUnique({
      where: { studentId_date: { studentId: student.id, date } },
    });

    const previousStatus = existing?.status ?? null;
    if (existing) {
      await prisma.attendance.update({ where: { id: existing.id }, data: { status } });
    } else {
      await prisma.attendance.create({
        data: { studentId: student.id, classId, date, status },
      });
      registered++;
    }

    if (previousStatus !== status) {
      await processAttendanceXp(student.id, status, previousStatus);
    }

    if (
      (status === "absent" || status === "late") &&
      previousStatus !== status
    ) {
      const st = await prisma.student.findUnique({
        where: { id: student.id },
        include: { user: { select: { fullName: true } } },
      });
      const label = ATTENDANCE_LABELS[status as AttendanceStatus] ?? status;
      const when = date.toLocaleDateString("pt-BR");
      if (st) {
        await notifyStudentParents(
          student.id,
          status === "absent" ? "Falta registrada" : "Atraso registrado",
          `${st.user.fullName}: ${label} em ${when}`,
          `/dashboard/responsavel/filho/${student.id}`,
          "absence"
        );
      }
    }
  }

  revalidateAll();
  return { success: true, message: `Chamada registrada para ${students.length} alunos (${registered} novos).` };
}

export async function requestMissionCompletionAction(formData: FormData) {
  const user = await requireSession(["student"]);
  const missionId = String(formData.get("missionId") ?? "");
  if (!missionId) return { error: "Missão inválida." };

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: { classGroup: { select: { teacherId: true, name: true } } },
  });
  if (!student) return { error: "Perfil de aluno não encontrado." };

  const mission = await prisma.mission.findFirst({
    where: {
      id: missionId,
      schoolId: user.schoolId ?? undefined,
      isActive: true,
      OR: [{ classId: null }, { classId: student.classId }],
    },
  });
  if (!mission) return { error: "Missão não encontrada." };

  const existing = await prisma.studentMission.findUnique({
    where: { studentId_missionId: { studentId: student.id, missionId } },
  });
  if (existing?.completedAt) {
    return { error: "Esta missão já foi concluída." };
  }

  if (!existing) {
    await prisma.studentMission.create({
      data: { studentId: student.id, missionId },
    });
  }

  const href = "/dashboard/gamificacao";
  const msg = `${user.fullName} pediu confirmação da missão "${mission.title}".`;

  if (student.classGroup?.teacherId) {
    await notifyUser(student.classGroup.teacherId, "Confirmar missão", msg, href);
  } else {
    await notifyClassTeacher(student.classId, "Confirmar missão", msg, href);
  }

  revalidateAll();
  revalidatePath("/dashboard/gamificacao");
  return { success: true };
}

export async function updateStudentAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const studentId = String(formData.get("studentId") ?? "");
  const classId = String(formData.get("classId") ?? "") || null;

  const student = await prisma.student.findFirst({
    where: { id: studentId, user: { schoolId: user.schoolId } },
  });
  if (!student) return { error: "Aluno não encontrado." };

  await prisma.student.update({ where: { id: studentId }, data: { classId } });
  revalidateAll();
  revalidatePath(`/dashboard/alunos/${studentId}`);
  return { success: true };
}

export async function createTeacherAction(formData: FormData) {
  const user = await requireSession(["admin", "director"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "demo123");

  if (!fullName || !email) return { error: "Nome e e-mail são obrigatórios." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "E-mail já cadastrado." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash, fullName, role: "teacher", schoolId: user.schoolId },
  });

  revalidatePath("/dashboard/professores");
  return { success: true };
}

export async function deleteStudentAction(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "");
  const user = await requireSession(["admin", "director"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const student = await prisma.student.findFirst({
    where: { id: studentId, user: { schoolId: user.schoolId } },
    include: { user: true },
  });
  if (!student) return { error: "Aluno não encontrado." };

  await prisma.user.delete({ where: { id: student.userId } });
  revalidateAll();
  return { success: true };
}

export async function updateSchoolAction(formData: FormData) {
  const user = await requireSession(["admin", "director"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();

  if (!name) return { error: "Nome da escola é obrigatório." };

  await prisma.school.update({
    where: { id: user.schoolId },
    data: { name, city, state },
  });

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateSchoolSettingsAction(formData: FormData) {
  const user = await requireSession(["admin", "director"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const raw = String(formData.get("settingsJson") ?? "");
  if (!raw) return { error: "Configurações inválidas." };

  let patch: Partial<SchoolSettings>;
  try {
    patch = JSON.parse(raw) as Partial<SchoolSettings>;
  } catch {
    return { error: "JSON de configurações inválido." };
  }

  const school = await prisma.school.findUnique({ where: { id: user.schoolId } });
  if (!school) return { error: "Escola não encontrada." };

  const current = parseSchoolSettings(school.settings);
  const merged = mergeSchoolSettings(current, patch);

  if (merged.academic.subjects.length === 0) {
    return { error: "Informe ao menos uma disciplina." };
  }
  if (merged.academic.periods.length === 0) {
    return { error: "Informe ao menos um período." };
  }
  if (merged.xp.xpPerLevel < 50) {
    return { error: "XP por nível deve ser no mínimo 50." };
  }
  if (merged.academic.maxGrade <= 0) {
    return { error: "Nota máxima inválida." };
  }

  await prisma.school.update({
    where: { id: user.schoolId },
    data: { settings: stringifySchoolSettings(merged) },
  });

  [
    "/dashboard/configuracoes",
    "/dashboard/notas",
    "/dashboard/gamificacao",
    "/dashboard/exercicios",
    "/dashboard/aluno",
    "/dashboard/professor",
    "/dashboard/loja",
  ].forEach((p) => revalidatePath(p));

  return { success: true };
}
