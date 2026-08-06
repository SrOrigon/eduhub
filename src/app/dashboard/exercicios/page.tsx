import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getExercisesForUser, getTeacherClasses, EXERCISE_KIND_LABELS } from "@/lib/exercises";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateExerciseForm } from "@/components/forms/create-exercise-form";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import { ClipboardCheck, PenLine } from "lucide-react";

export default async function ExerciciosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "parent") redirect("/dashboard/responsavel");

  const isStaff = user.role === "admin" || user.role === "director" || user.role === "teacher";
  const [exercises, classes] = await Promise.all([
    getExercisesForUser(user),
    isStaff ? getTeacherClasses(user) : Promise.resolve([]),
  ]);

  const description =
    user.role === "student"
      ? "Exercícios e provas da sua turma — responda e acompanhe a correção"
      : "Crie, edite e corrija exercícios de casa e provas com XP e moedas";

  return (
    <div className="space-y-6">
      <PageHeader title="Exercícios" description={description}>
        {isStaff && classes.length > 0 && <CreateExerciseForm classes={classes} />}
      </PageHeader>

      {exercises.length === 0 ? (
        <EmptyState
          icon={PenLine}
          title={isStaff ? "Nenhum exercício publicado" : "Nenhum exercício disponível"}
          description={
            isStaff
              ? "Clique em + Novo exercício para publicar atividades para sua turma."
              : "Quando o professor publicar, aparecerá aqui."
          }
        />
      ) : (
        <div className="grid gap-4">
          {exercises.map((ex) => {
            const submission =
              user.role === "student"
                ? ex.submissions[0]
                : undefined;
            const pendingCount =
              isStaff && "submissions" in ex
                ? ex.submissions.filter((s) => s.status === "submitted").length
                : 0;

            return (
              <Card key={ex.id}>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <CardTitle className="text-lg">{ex.title}</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      {EXERCISE_KIND_LABELS[ex.kind as keyof typeof EXERCISE_KIND_LABELS] ?? ex.kind}
                      {ex.classGroup && ` · ${ex.classGroup.name}`}
                      {isStaff && ` · Prof. ${ex.teacher.fullName}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={ex.kind === "exam" ? "warning" : "default"}>
                      {ex.maxPoints} pts
                    </Badge>
                    <Badge variant="success">+{ex.xpReward} XP</Badge>
                    <Badge variant="warning">+{ex.coinReward} moedas</Badge>
                    {!ex.isActive && <Badge variant="danger">Inativo</Badge>}
                    {submission?.status === "graded" && (
                      <Badge variant="success">
                        Nota: {submission.score?.toFixed(1)}/{submission.maxScore?.toFixed(1)}
                      </Badge>
                    )}
                    {submission?.status === "submitted" && (
                      <Badge>Aguardando correção</Badge>
                    )}
                    {pendingCount > 0 && (
                      <Badge variant="warning">{pendingCount} para corrigir</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-slate-600">
                    {ex.dueDate && <p>Prazo: {formatDate(ex.dueDate)}</p>}
                    <p>{ex.questions.length} questão(ões)</p>
                  </div>
                  <Link href={`/dashboard/exercicios/${ex.id}`}>
                    <Badge variant="default" className="cursor-pointer px-4 py-2">
                      {user.role === "student"
                        ? submission
                          ? "Ver entrega"
                          : "Responder"
                        : "Gerenciar"}
                    </Badge>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {isStaff && (
        <Card className="border-indigo-100 bg-indigo-50/50">
          <CardContent className="flex items-start gap-3 py-4">
            <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Privacidade dos responsáveis</p>
              <p className="mt-1">
                Professores veem apenas nome e e-mail dos alunos na correção — dados sensíveis como CPF/CNPJ
                não são armazenados no sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
