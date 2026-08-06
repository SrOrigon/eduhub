"use client";

import { useActionState } from "react";
import { redeemRewardAction } from "@/actions/rewards";
import { Button } from "@/components/ui/button";

export function RedeemRewardButton({
  rewardId,
  studentId,
  coinCost,
  canAfford,
  outOfStock,
  rewardName,
}: {
  rewardId: string;
  studentId: string;
  coinCost: number;
  canAfford: boolean;
  outOfStock: boolean;
  rewardName: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean; message?: string } | null, formData: FormData) => {
      return await redeemRewardAction(formData);
    },
    null
  );

  if (outOfStock) {
    return (
      <p className="text-base font-semibold text-red-700" role="status">
        Esgotado no momento
      </p>
    );
  }

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="rewardId" value={rewardId} />
        <input type="hidden" name="studentId" value={studentId} />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending || !canAfford}
          aria-label={`Resgatar ${rewardName} por ${coinCost} moedas`}
        >
          {pending ? "Resgatando..." : canAfford ? `Resgatar (${coinCost} moedas)` : "Moedas insuficientes"}
        </Button>
      </form>
      {state?.error && (
        <p className="mt-2 text-base font-medium text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p className="mt-2 text-base font-medium text-emerald-700" role="status">
          {state.message}
        </p>
      )}
    </div>
  );
}
