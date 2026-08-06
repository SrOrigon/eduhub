import { getSessionUser } from "@/lib/auth";
import { getExercisesForUser, getTeacherClasses } from "@/lib/exercises";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { CreateExerciseForm } from "@/components/forms/create-exercise-form";
import { StudentExercisesList } from "@/components/exercises/student-exercises-list";
import { TeacherExercisesList } from "@/components/exercises/teacher-exercises-list";
import { TeacherExerciseStats } from "@/components/exercises/teacher-exercise-stats";
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

  const pendingGrades = isStaff
    ? exercises.reduce(
        (n, ex) => n + ex.submissions.filter((s) => s.status === "submitted").length,
        0
      )
    : 0;
  const activeCount = exercises.filter((ex) => ex.isActive).length;

  const description =
    user.role === "student"
      ? "Veja o que falta fazer, acompanhe correções e ganhe XP"
      : pendingGrades > 0
        ? `${pendingGrades} entrega(s) aguardando sua correção`
        : "Publique atividades, acompanhe entregas e corrija com um clique";

  return (
    <div className="space-y-6">
      <PageHeader title="Exercícios" description={description}>
        {isStaff && classes.length > 0 && <CreateExerciseForm classes={classes} />}
      </PageHeader>

      {isStaff && exercises.length > 0 && (
        <TeacherExerciseStats
          total={exercises.length}
          pendingGrades={pendingGrades}
          active={activeCount}
        />
      )}

      {exercises.length === 0 ? (
        <EmptyState
          icon={PenLine}
          title={isStaff ? "Nenhum exercício publicado" : "Nenhum exercício disponível"}
          description={
            isStaff
              ? "Clique em Publicar atividade para enviar a primeira atividade à turma."
              : "Quando o professor publicar, aparecerá aqui com XP e moedas para ganhar!"
          }
        />
      ) : user.role === "student" ? (
        <StudentExercisesList exercises={exercises} />
      ) : (
        <TeacherExercisesList exercises={exercises} />
      )}

      {isStaff && (
        <Card className="border-indigo-100 bg-indigo-50/50">
          <CardContent className="flex items-start gap-3 py-4">
            <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Dica rápida</p>
              <p className="mt-1">
                Use &quot;Aplicar gabarito&quot; na correção para questões de múltipla escolha — você
                só precisa revisar as respostas abertas manualmente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
