import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRanking } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { BookOpen, ClipboardList, Users, Medal } from "lucide-react";

export default async function TeacherDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/dashboard");

  const myClasses = await prisma.classGroup.findMany({
    where: { teacherId: user.id },
    include: {
      students: { include: { user: { select: { fullName: true } }, grades: { select: { value: true } } } },
      _count: { select: { students: true } },
    },
  });

  const totalStudents = myClasses.reduce((s, c) => s + c._count.students, 0);
  const [ranking] = await Promise.all([
    getRanking(user.schoolId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel do Professor"
        description={`Olá, ${user.fullName}! Gerencie suas turmas e acompanhe o engajamento.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-500">Minhas turmas</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{myClasses.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-500">Total de alunos</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalStudents}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-500">Ações rápidas</CardTitle>
            <ClipboardList className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/dashboard/notas"><Button size="sm" variant="outline">Lançar nota</Button></Link>
            <Link href="/dashboard/frequencia"><Button size="sm" variant="outline">Frequência</Button></Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {myClasses.map((turma) => {
          const allGrades = turma.students.flatMap((s) => s.grades);
          const media = allGrades.length > 0
            ? allGrades.reduce((sum, g) => sum + g.value, 0) / allGrades.length
            : 0;
          return (
            <Card key={turma.id}>
              <CardHeader>
                <CardTitle>{turma.name}</CardTitle>
                <p className="text-sm text-slate-500">{turma._count.students} alunos · Média {media.toFixed(1)}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {turma.students.map((s) => (
                    <li key={s.id} className="flex justify-between">
                      <span>{s.user.fullName}</span>
                      <Badge variant="default">Nv. {s.level}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {myClasses.length === 0 && (
        <EmptyState
          title="Nenhuma turma atribuída"
          description="Peça ao diretor para vincular turmas ao seu perfil."
        />
      )}

      <Card>
        <CardHeader><CardTitle>Ranking da escola</CardTitle></CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <EmptyState
              icon={Medal}
              title="Ranking indisponível"
              description="Ainda não há alunos com XP na escola."
              className="py-6"
            />
          ) : (
            <ol className="space-y-2">
              {ranking.slice(0, 5).map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>#{item.rank} {item.name}</span>
                  <span className="font-medium text-indigo-600">{item.xp} XP</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
