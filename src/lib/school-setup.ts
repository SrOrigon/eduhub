import { prisma } from "@/lib/db";

export async function ensureDefaultBadges(schoolId: string) {
  const count = await prisma.badge.count({ where: { schoolId } });
  if (count > 0) return;

  await prisma.badge.createMany({
    data: [
      { schoolId, name: "Pontualidade", description: "30 dias sem faltas", icon: "clock", xpRequired: 500 },
      { schoolId, name: "Estudante Estrela", description: "Média acima de 9.0", icon: "star", xpRequired: 1000 },
      { schoolId, name: "Missão Completa", description: "5 missões concluídas", icon: "target", xpRequired: 750 },
    ],
  });
}

export async function ensureDefaultRewards(schoolId: string) {
  const count = await prisma.reward.count({ where: { schoolId } });
  if (count > 0) return;

  await prisma.reward.createMany({
    data: [
      { schoolId, name: "Caneta EduHub", description: "Caneta personalizada da escola", coinCost: 50, stock: 20 },
      { schoolId, name: "1 ponto extra", description: "Bônus de 1 ponto em qualquer disciplina", coinCost: 150, stock: 10 },
      { schoolId, name: "Intervalo estendido", description: "15 min extras no intervalo (1x por mês)", coinCost: 200, stock: 5 },
      { schoolId, name: "Camiseta da turma", description: "Camiseta exclusiva da turma", coinCost: 500, stock: 3 },
      { schoolId, name: "Vale-lanche", description: "Vale lanche na cantina", coinCost: 80, stock: null },
    ],
  });
}
