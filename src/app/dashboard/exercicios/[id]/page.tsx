import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getExerciseById, EXERCISE_KIND_LABELS } from "@/lib/exercises";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseSubmitForm } from "@/components/forms/exercise-submit-form";
import { GradeSubmissionForm } from "@/components/forms/grade-submission-form";
import { EditExerciseForm } from "@/components/forms/edit-exercise-form";
import { formatDate } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const exercise = await getExerciseById(id, user);
  if (!exercise) notFound();

  const isStaff =
    user.role === "admin" || user.role === "director" || user.role === "teacher";
  const canEdit = isStaff && (user.role !== "teacher" || exercise.teacherId === user.id);

  let studentSubmission = null;
  if (user.role === "student") {
    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    studentSubmission = exercise.submissions.find((s) => s.studentId === student?.id) ?? null;
  }

  const answerMap = studentSubmission
    ? Object.fromEntries(studentSubmission.answers.map((a) => [a.questionId, a]))
    : undefined;

  const pastDue = exercise.dueDate ? new Date() > exercise.dueDate : false;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/dashboard/exercicios"
        backLabel="Voltar aos exercícios"
        title={exercise.title}
        description={
          `${EXERCISE_KIND_LABELS[exercise.kind as keyof typeof EXERCISE_KIND_LABELS] ?? exercise.kind}` +
          (exercise.classGroup ? ` · ${exercise.classGroup.name}` : "")
        }
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">+{exercise.xpReward} XP</Badge>
          <Badge variant="warning">+{exercise.coinReward} moedas</Badge>
          {!exercise.isActive && <Badge variant="danger">Inativo</Badge>}
        </div>
      </PageHeader>

      {exercise.description && (
        <Card>
          <CardContent className="py-4 text-slate-700">{exercise.description}</CardContent>
        </Card>
      )}

      {exercise.dueDate && (
        <p className="text-sm text-slate-600">
          Prazo: <strong>{formatDate(exercise.dueDate)}</strong>
          {pastDue && user.role === "student" && !studentSubmission && (
            <span className="ml-2 text-red-600">(prazo encerrado)</span>
          )}
        </p>
      )}

      {user.role === "student" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {studentSubmission?.status === "graded"
                ? "Sua entrega — corrigida"
                : studentSubmission
                  ? "Revisar e reenviar"
                  : "Responder exercício"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentSubmission?.status === "graded" ? (
              <>
                <p className="mb-4 text-lg font-bold text-indigo-700">
                  Nota: {studentSubmission.score?.toFixed(1)} / {studentSubmission.maxScore?.toFixed(1)} pts
                </p>
                {studentSubmission.feedback && (
                  <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    Feedback: {studentSubmission.feedback}
                  </p>
                )}
                <ExerciseSubmitForm
                  exerciseId={exercise.id}
                  questions={exercise.questions}
                  readOnly
                  existingAnswers={answerMap}
                />
              </>
            ) : !pastDue || studentSubmission ? (
              <ExerciseSubmitForm
                exerciseId={exercise.id}
                questions={exercise.questions}
                existingAnswers={answerMap}
              />
            ) : (
              <p className="text-slate-600">O prazo para entrega encerrou.</p>
            )}
          </CardContent>
        </Card>
      )}

      {isStaff && (
        <>
          {canEdit && (
            <EditExerciseForm
              exercise={{
                id: exercise.id,
                title: exercise.title,
                description: exercise.description,
                kind: exercise.kind,
                maxPoints: exercise.maxPoints,
                xpReward: exercise.xpReward,
                coinReward: exercise.coinReward,
                dueDate: exercise.dueDate?.toISOString().slice(0, 16) ?? "",
                isActive: exercise.isActive,
              }}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Entregas dos alunos ({exercise.submissions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {exercise.submissions.length === 0 && (
                <p className="text-slate-500">Nenhuma entrega ainda.</p>
              )}
              {exercise.submissions.map((sub) =>
                sub.status === "graded" ? (
                  <div key={sub.id} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <p className="font-semibold">{sub.student.user.fullName}</p>
                    <p className="text-sm text-emerald-800">
                      Corrigido: {sub.score?.toFixed(1)}/{sub.maxScore?.toFixed(1)} pts
                    </p>
                    {sub.feedback && <p className="mt-1 text-sm text-slate-600">{sub.feedback}</p>}
                  </div>
                ) : (
                  <GradeSubmissionForm
                    key={sub.id}
                    submissionId={sub.id}
                    studentName={sub.student.user.fullName}
                    questions={exercise.questions}
                    answers={sub.answers}
                  />
                )
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
