import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getChildForParent } from "@/actions/parents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { formatDate } from "@/lib/utils";
import { ATTENDANCE_LABELS, type AttendanceStatus } from "@/lib/constants";
import { notFound, redirect } from "next/navigation";
import { BookOpen, FileText, Gift, Medal, Target } from "lucide-react";

function attendanceLabel(status: string) {
  return ATTENDANCE_LABELS[status as AttendanceStatus] ?? status;
}

export default async function FilhoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "parent") redirect("/dashboard");

  const { id } = await params;
  const link = await getChildForParent(user.id, id);
  if (!link) notFound();

  const student = link.student;
  const avgGrade =
    student.grades.length > 0
      ? student.grades.reduce((s, g) => s + g.value, 0) / student.grades.length
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/dashboard/responsavel"
        backLabel="Voltar aos filhos"
        title={student.user.fullName}
        description={`${student.classGroup?.name ?? "Sem turma"} · Matrícula ${student.enrollmentCode}`}
      >
        <Link href={`/dashboard/alunos/${student.id}/boletim`}>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            Boletim completo
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm text-slate-500">Média geral</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{avgGrade.toFixed(1)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-slate-500">Nível / XP</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-indigo-600">Nv.{student.level} · {student.xpTotal}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-slate-500">Moedas</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-amber-600">{student.coins}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-slate-500">Conquistas</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{student.studentBadges.length}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
          <CardContent>
            {student.grades.length === 0 ? (
              <EmptyState icon={BookOpen} title="Sem notas" description="Nenhuma nota lançada ainda." className="py-6" />
            ) : (
              <ul className="space-y-2 text-sm">
                {student.grades.map((g) => (
                  <li key={g.id} className="flex justify-between border-b border-slate-100 py-2">
                    <span>{g.subject} · {g.period}</span>
                    <Badge variant={g.value >= 7 ? "success" : g.value >= 5 ? "warning" : "danger"}>
                      {g.value.toFixed(1)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Frequência recente</CardTitle></CardHeader>
          <CardContent>
            {student.attendance.length === 0 ? (
              <EmptyState title="Sem registros" description="A frequência aparecerá após a chamada." className="py-6" />
            ) : (
              <ul className="space-y-2 text-sm">
                {student.attendance.map((a) => (
                  <li key={a.id} className="flex justify-between border-b border-slate-100 py-2">
                    <span>{formatDate(a.date)}</span>
                    <Badge>{attendanceLabel(a.status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Missões</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {student.studentMissions.length === 0 ? (
              <EmptyState icon={Target} title="Sem missões" description="Missões atribuídas aparecerão aqui." className="py-6" />
            ) : (
              student.studentMissions.map((sm) => (
                <div key={sm.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium">{sm.mission.title}</p>
                  <p className="text-xs text-slate-500">
                    {sm.completedAt ? `Concluída em ${formatDate(sm.completedAt)}` : "Em andamento"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Badges e resgates</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {student.studentBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {student.studentBadges.map((sb) => (
                  <Badge key={sb.id} variant="default">
                    <Medal className="mr-1 h-3 w-3" aria-hidden="true" />
                    {sb.badge.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nenhuma conquista ainda.</p>
            )}

            <div>
              <p className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700">
                <Gift className="h-4 w-4" aria-hidden="true" /> Resgates na loja
              </p>
              {student.rewardRedemptions.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum resgate ainda.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {student.rewardRedemptions.map((r) => (
                    <li key={r.id} className="flex justify-between border-b border-slate-100 py-2">
                      <span>{r.reward.name}</span>
                      <span className="text-amber-600">-{r.coinCost} moedas</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
