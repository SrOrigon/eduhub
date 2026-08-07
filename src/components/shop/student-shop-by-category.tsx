import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RedeemRewardButton } from "@/components/forms/redeem-reward-button";
import { isKidFriendlyRole } from "@/lib/constants";
import type { UserRole } from "@/lib/constants";

type RewardItem = {
  id: string;
  name: string;
  description: string | null;
  coinCost: number;
  stock: number | null;
  isActive: boolean;
  categoryId: string | null;
  category: { id: string; name: string; isActive: boolean } | null;
};

type CategoryItem = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

function RewardCard({
  reward,
  student,
  kidFriendly,
}: {
  reward: RewardItem;
  student: { id: string; coins: number };
  kidFriendly: boolean;
}) {
  const outOfStock = reward.stock !== null && reward.stock <= 0;
  const canAfford = student.coins >= reward.coinCost;

  return (
    <Card className={`${kidFriendly ? "kid-card" : ""} ${!reward.isActive ? "opacity-60" : ""}`}>
      <CardHeader>
        <CardTitle className={kidFriendly ? "text-xl" : "text-base"}>{reward.name}</CardTitle>
        <CardDescription className={kidFriendly ? "text-base" : undefined}>
          {reward.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="warning" className={kidFriendly ? "px-3 py-1 text-base" : undefined}>
            {reward.coinCost} moedas
          </Badge>
          {reward.stock !== null && (
            <Badge variant={outOfStock ? "danger" : "secondary"}>
              {outOfStock ? "Esgotado" : `${reward.stock} disponíveis`}
            </Badge>
          )}
        </div>
        {reward.isActive && (
          <RedeemRewardButton
            rewardId={reward.id}
            studentId={student.id}
            coinCost={reward.coinCost}
            canAfford={canAfford}
            outOfStock={outOfStock}
            rewardName={reward.name}
          />
        )}
      </CardContent>
    </Card>
  );
}

export function StudentShopByCategory({
  rewards,
  categories,
  student,
  role,
  preview = false,
}: {
  rewards: RewardItem[];
  categories: CategoryItem[];
  student?: { id: string; coins: number } | null;
  role: UserRole;
  preview?: boolean;
}) {
  const kidFriendly = isKidFriendlyRole(role);
  const visibleRewards = preview
    ? rewards.filter((r) => r.isActive)
    : rewards.filter((r) => r.isActive && (r.category?.isActive !== false));

  const activeCategories = categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const uncategorized = visibleRewards.filter((r) => !r.categoryId);

  if (visibleRewards.length === 0) {
    return (
      <Card className="kid-card">
        <CardContent className="py-10 text-center text-lg text-slate-600">
          Nenhum prêmio disponível no momento.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {activeCategories.map((cat) => {
        const items = visibleRewards.filter((r) => r.categoryId === cat.id);
        if (items.length === 0) return null;

        return (
          <section key={cat.id} aria-labelledby={`shop-cat-${cat.id}`}>
            <div className="mb-4">
              <h2 id={`shop-cat-${cat.id}`} className="text-xl font-bold text-slate-900">
                {cat.name}
              </h2>
              {cat.description && <p className="text-sm text-slate-600">{cat.description}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((reward) =>
                student && !preview ? (
                  <RewardCard key={reward.id} reward={reward} student={student} kidFriendly={kidFriendly} />
                ) : (
                  <Card key={reward.id} className={kidFriendly ? "kid-card" : ""}>
                    <CardHeader>
                      <CardTitle className={kidFriendly ? "text-xl" : "text-base"}>{reward.name}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="warning">{reward.coinCost} moedas</Badge>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </section>
        );
      })}

      {uncategorized.length > 0 && (
        <section aria-labelledby="shop-cat-other">
          <div className="mb-4">
            <h2 id="shop-cat-other" className="text-xl font-bold text-slate-900">
              Outros
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uncategorized.map((reward) =>
              student && !preview ? (
                <RewardCard key={reward.id} reward={reward} student={student} kidFriendly={kidFriendly} />
              ) : (
                <Card key={reward.id}>
                  <CardHeader>
                    <CardTitle>{reward.name}</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="warning">{reward.coinCost} moedas</Badge>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}
