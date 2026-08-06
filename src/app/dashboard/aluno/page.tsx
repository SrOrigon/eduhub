import Link from "next/link";
import { Gift, Star, Trophy, Coins, FileText } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRanking, getMissionsForStudent } from "@/lib/queries";
import { getXpProgress } from "@/lib/gamification";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function AlunoPortalPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/dashboard");

  const student = await prisma.student.findFirst({
    where: { userId: user.id },
    include: {
      classGroup: true,
      grades: { orderBy: { createdAt: "desc" } },
      studentMissions: { include: { mission: true } },
      studentBadges: { include: { badge: true } },
      xpTransactions: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!student) {
    return (
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 text-lg" role="alert">
        <p>Perfil de aluno não encontrado. Peça ajuda à secretaria da escola.</p>
      </div>
    );
  }

  const [ranking, missions] = await Promise.all([
    getRanking(user.schoolId),
    getMissionsForStudent(user.schoolId, student.classId),
  ]);

  const myRank = ranking.find((r) => r.id === student.id);
  const avgGrade =
    student.grades.length > 0
      ? student.grades.reduce((s, g) => s + g.value, 0) / student.grades.length
      : 0;

  const { percent: xpProgress, xpForNextLevel } = getXpProgress(student.xpTotal);
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Olá, ${firstName}!`}
        description={`${student.classGroup?.name ?? "Sem turma"} · Matrícula ${student.enrollmentCode}`}
      >
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link href={`/dashboard/alunos/${student.id}/boletim`} className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
              <FileText className="h-5 w-5" aria-hidden="true" />
              Meu boletim
            </Button>
          </Link>
          <Link href="/dashboard/loja" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 sm:w-auto">
              <Gift className="h-5 w-5" aria-hidden="true" />
              Loja ({student.coins} moedas)
            </Button>
          </Link>
        </div>
      </PageHeader>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Seu progresso
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="kid-card border-indigo-300 bg-gradient-to-br from-indigo-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                <Star className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                Nível {student.level}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="kid-stat text-indigo-700">{student.xpTotal} XP</p>
              <div
                className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuenow={xpProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progresso para o próximo nível: ${xpProgress}%`}
              >
                <div className="h-4 rounded-full bg-indigo-600 transition-all" style={{ width: `${xpProgress}%` }} />
              </div>
              <p className="mt-2 text-base text-slate-600">Próximo nível: {xpForNextLevel} XP</p>
            </CardContent>
          </Card>

          <Card className="kid-card border-amber-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                <Coins className="h-5 w-5 text-amber-600" aria-hidden="true" />
                Moedas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="kid-stat text-amber-600">{student.coins}</p>
              <p className="mt-2 text-base text-slate-600">Use na loja de recompensas</p>
            </CardContent>
          </Card>

          <Card className="kid-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-700">Média das notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="kid-stat text-slate-900">{avgGrade.toFixed(1)}</p>
            </CardContent>
          </Card>

          <Card className="kid-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                <Trophy className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="kid-stat text-emerald-700">#{myRank?.rank ?? "-"}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="kid-card">
          <CardHeader>
            <CardTitle className="text-xl">Minhas missões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {missions.length === 0 && (
              <p className="text-lg text-slate-600">Nenhuma missão no momento. Volte em breve!</p>
            )}
            {missions.map((mission) => {
              const done = student.studentMissions.some(
                (sm) => sm.missionId === mission.id && sm.completedAt
              );
              return (
                <article key={mission.id} className="rounded-2xl border-2 border-slate-200 p-4">
                  <h3 className="text-lg font-bold text-slate-900">{mission.title}</h3>
                  <p className="mt-1 text-base text-slate-600">{mission.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>+{mission.xpReward} XP</Badge>
                    <Badge variant="warning">+{mission.coinReward} moedas</Badge>
                  </div>
                  <div className="mt-4">
                    {done ? (
                      <p className="text-base font-bold text-emerald-700" role="status">
                        Missão concluída!
                      </p>
                    ) : (
                      <p className="text-base text-slate-600">
                        Faça a atividade e peça ao professor para marcar como concluída.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </CardContent>
        </Card>

        <Card className="kid-card">
          <CardHeader>
            <CardTitle className="text-xl">Suas conquistas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {student.studentBadges.length === 0 && (
                <p className="text-lg text-slate-600">
                  Complete missões e mantenha boas notas para ganhar badges!
                </p>
              )}
              {student.studentBadges.map((sb) => (
                <Badge key={sb.id} variant="success" className="px-3 py-1.5 text-base">
                  {sb.badge.name}
                </Badge>
              ))}
            </div>
            <h3 className="mb-3 mt-6 text-lg font-bold">Atividade recente</h3>
            <ul className="space-y-3 text-base">
              {student.xpTransactions.length === 0 && (
                <li className="text-slate-600">Nenhuma atividade registrada ainda.</li>
              )}
              {student.xpTransactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <span>{tx.reason}</span>
                  <Badge variant="success">+{tx.amount} XP</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
