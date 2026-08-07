"use server";

import { requireSession } from "@/lib/auth";
import { getSchoolSettings } from "@/lib/school-settings";
import { generateQuestionsWithAi } from "@/lib/ai-questions";

export async function generateExerciseQuestionsAction(formData: FormData) {
  const user = await requireSession(["admin", "director", "teacher"]);
  if (!user.schoolId) return { error: "Escola não configurada." };

  const settings = await getSchoolSettings(user.schoolId);
  if (!settings.ai.enabled) return { error: "Assistente IA desativado nas configurações." };

  const topic = formData.get("topic")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim() ?? "Geral";
  const count = Number(formData.get("count") ?? 3);
  const bncc = formData.get("bncc")?.toString().trim();

  if (!topic) return { error: "Informe o tema das questões." };

  const questions = await generateQuestionsWithAi(topic, subject, count, bncc);
  return { success: true, questions };
}
