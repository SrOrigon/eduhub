import { getSessionUser } from "@/lib/auth";
import { getClasses, getTeachers } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateClassForm } from "@/components/forms/create-class-form";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TurmasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "student") redirect("/dashboard/aluno");

  const [classes, teachers] = await Promise.all([
    getClasses(user.schoolId),
    getTeachers(user.schoolId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Turmas" description="Organização de turmas, professores e alunos">
        {(user.role === "admin" || user.role === "director") && (
          <CreateClassForm teachers={teachers} />
        )}
      </PageHeader>

      {classes.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhuma turma cadastrada"
          description="Crie a primeira turma para começar a matricular alunos."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((turma) => (
            <Card key={turma.id}>
              <CardHeader>
                <CardTitle>{turma.name}</CardTitle>
                <p className="text-sm text-slate-500">
                  {turma.gradeLevel}º ano · {turma.year} · Prof. {turma.teacher?.fullName ?? "Não definido"}
                </p>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm font-medium">{turma._count.students} alunos matriculados</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  {turma.students.map((a) => (
                    <li key={a.id} className="truncate">• {a.user.fullName}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
