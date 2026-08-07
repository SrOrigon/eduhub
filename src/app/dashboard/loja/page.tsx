import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRewardsForSchool, getStudentRedemptions } from "@/actions/rewards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRewardForm } from "@/components/forms/create-reward-form";
import { PageHeader } from "@/components/layout/page-header";
import { RedeemRewardButton } from "@/components/forms/redeem-reward-button";
import { ToggleRewardButton } from "@/components/forms/toggle-reward-button";
import { FulfillRedemptionButton } from "@/components/forms/fulfill-redemption-button";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { isKidFriendlyRole } from "@/lib/constants";

export default async function LojaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const isAdmin = user.role === "admin" || user.role === "director";
  const isStaff = isAdmin || user.role === "teacher";
  const isStudent = user.role === "student";
  const kidFriendly = isKidFriendlyRole(user.role);

  let student = null;
  if (isStudent) {
    student = await prisma.student.findFirst({ where: { userId: user.id } });
    if (!student) redirect("/dashboard/aluno");
  }

  const rewards = await getRewardsForSchool(user.schoolId);
  const redemptions = student
    ? await getStudentRedemptions(student.id)
    : isStaff
      ? await prisma.rewardRedemption.findMany({
          where: { student: { user: { schoolId: user.schoolId } } },
          include: {
            student: { include: { user: { select: { fullName: true } } } },
            reward: true,
          },
          orderBy: { redeemedAt: "desc" },
          take: 30,
        })
      : [];

  const pendingCount = isStaff
    ? redemptions.filter((r) => r.status === "pending").length
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Loja de Recompensas"
        description={
          isStudent
            ? `Você tem ${student?.coins ?? 0} moedas. Escolha um prêmio!`
            : pendingCount > 0
              ? `${pendingCount} resgate(s) aguardando entrega`
              : "Gerencie prêmios e acompanhe resgates"
        }
      >
        {isAdmin && <CreateRewardForm />}
      </PageHeader>

      {isStudent && student && (
        <Card className="kid-card border-amber-300 bg-amber-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <span className="text-lg font-bold text-amber-900">Suas moedas</span>
            <span className="kid-stat text-amber-600" aria-label={`${student.coins} moedas disponíveis`}>
              {student.coins}
            </span>
          </CardContent>
        </Card>
      )}

      <section aria-labelledby="rewards-heading">
        <h2 id="rewards-heading" className="sr-only">
          Prêmios disponíveis
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const outOfStock = reward.stock !== null && reward.stock <= 0;
            const canAfford = student ? student.coins >= reward.coinCost : false;

            return (
              <Card key={reward.id} className={`${kidFriendly ? "kid-card" : ""} ${!reward.isActive ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className={kidFriendly ? "text-xl" : "text-base"}>{reward.name}</CardTitle>
                      <CardDescription className={kidFriendly ? "text-base" : undefined}>
                        {reward.description}
                      </CardDescription>
                    </div>
                    {!reward.isActive && <Badge variant="secondary">Inativa</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="warning" className={kidFriendly ? "text-base px-3 py-1" : undefined}>
                      {reward.coinCost} moedas
                    </Badge>
                    {reward.stock !== null && (
                      <Badge variant={outOfStock ? "danger" : "secondary"}>
                        {outOfStock ? "Esgotado" : `${reward.stock} disponíveis`}
                      </Badge>
                    )}
                    {isAdmin && (
                      <Badge variant="default">{reward._count.redemptions} resgates</Badge>
                    )}
                  </div>

                  {isStudent && student && reward.isActive && (
                    <RedeemRewardButton
                      rewardId={reward.id}
                      studentId={student.id}
                      coinCost={reward.coinCost}
                      canAfford={canAfford}
                      outOfStock={outOfStock}
                      rewardName={reward.name}
                    />
                  )}

                  {isAdmin && <ToggleRewardButton rewardId={reward.id} isActive={reward.isActive} />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {rewards.length === 0 && (
        <Card className="kid-card">
          <CardContent className="py-10 text-center text-lg text-slate-600">
            Nenhuma recompensa cadastrada. {isAdmin && 'Clique em "+ Nova recompensa".'}
          </CardContent>
        </Card>
      )}

      <Card className={kidFriendly ? "kid-card" : ""}>
        <CardHeader>
          <CardTitle className={kidFriendly ? "text-xl" : undefined}>
            {isStudent ? "Meus resgates" : "Resgates recentes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <p className={kidFriendly ? "text-lg text-slate-600" : "text-sm text-slate-500"}>
              Nenhum resgate ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {redemptions.map((r) => (
                <li
                  key={r.id}
                  className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 ${kidFriendly ? "text-base" : "text-sm"}`}
                >
                  <span>
                    {!isStudent && "student" in r && (
                      <strong>
                        {(r as { student: { user: { fullName: string } } }).student.user.fullName}:{" "}
                      </strong>
                    )}
                    {r.reward.name}
                    <Badge
                      variant={r.status === "fulfilled" ? "success" : "warning"}
                      className="ml-2"
                    >
                      {r.status === "fulfilled" ? "Entregue" : "Aguardando entrega"}
                    </Badge>
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-slate-600">
                      -{r.coinCost} moedas · {formatDate(r.redeemedAt)}
                    </span>
                    {isStaff && r.status === "pending" && (
                      <FulfillRedemptionButton redemptionId={r.id} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
