import { Clock, Star, Target } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getMissions, getBadges, getRanking, getStudents } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateMissionForm } from "@/components/forms/create-mission-form";
import { EditMissionForm } from "@/components/forms/edit-mission-form";
import { StaffCompleteMissionForm } from "@/components/forms/staff-complete-mission-form";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getClasses } from "@/lib/queries";
import { redirect } from "next/navigation";

const iconMap = { clock: Clock, star: Star, target: Target };

export default async function GamificacaoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "student") redirect("/dashboard/aluno");

  const [missions, badges, ranking, classes, students] = await Promise.all([
    getMissions(user.schoolId),
    getBadges(user.schoolId),
    getRanking(user.schoolId),
    getClasses(user.schoolId),
    getStudents(user.schoolId),
  ]);

  const classOptions = classes.map((c) => ({ id: c.id, name: c.name }));
  const isStaff = user.role === "director" || user.role === "teacher" || user.role === "admin";

  function studentsForMission(classId: string | null) {
    const pool = classId ? students.filter((s) => s.classId === classId) : students;
    return pool.map((s) => ({
      id: s.id,
      name: s.user.fullName,
      completed: false,
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Gamificação" description="Missões, XP, moedas, badges e rankings">
        {isStaff && <CreateMissionForm classes={classOptions} />}
      </PageHeader>

      {badges.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Nenhuma badge cadastrada"
          description="Badges são criadas automaticamente ao registrar a escola."
        />
      ) : (
        <div className="responsive-grid">
          {badges.map((badge) => {
            const Icon = iconMap[badge.icon as keyof typeof iconMap] ?? Star;
            return (
              <Card key={badge.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <Icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base">{badge.name}</CardTitle>
                      <CardDescription>{badge.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="default">{badge.xpRequired} XP · {badge._count.studentBadges} alunos</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Missões ({missions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {missions.length === 0 && (
              <EmptyState
                icon={Target}
                title="Nenhuma missão criada"
                description="Crie missões para engajar os alunos com XP e moedas."
              />
            )}
            {missions.map((mission) => {
              const completions = mission.studentMissions.filter((sm) => sm.completedAt).length;
              const eligibleStudents = studentsForMission(mission.classId).map((s) => ({
                ...s,
                completed: mission.studentMissions.some(
                  (sm) => sm.studentId === s.id && sm.completedAt
                ),
              }));

              return (
                <div key={mission.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{mission.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{mission.description}</p>
                      {mission.classGroup && (
                        <p className="mt-1 text-xs text-slate-400">Turma: {mission.classGroup.name}</p>
                      )}
                    </div>
                    {mission.isActive ? (
                      <Badge variant="success">Ativa</Badge>
                    ) : (
                      <Badge variant="secondary">Inativa</Badge>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge>+{mission.xpReward} XP</Badge>
                    <Badge variant="warning">+{mission.coinReward} moedas</Badge>
                    <span className="text-xs text-slate-500">{completions} conclusões</span>
                  </div>
                  {isStaff && (
                    <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                      <EditMissionForm mission={mission} classes={classOptions} />
                      {mission.isActive && (
                        <StaffCompleteMissionForm missionId={mission.id} students={eligibleStudents} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Ranking geral</CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <EmptyState title="Ranking vazio" description="Cadastre alunos para ver o ranking." />
            ) : (
              <ol className="space-y-3">
                {ranking.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      {item.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="truncate text-xs text-slate-500">{item.className}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-indigo-600">{item.xp} XP</p>
                      <p className="text-xs text-slate-500">Nv. {item.level} · {item.coins} moedas</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
