"use client";

import { useActionState } from "react";
import { toggleRewardAction } from "@/actions/rewards";
import { Button } from "@/components/ui/button";

export function ToggleRewardButton({ rewardId, isActive }: { rewardId: string; isActive: boolean }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => toggleRewardAction(formData),
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="rewardId" value={rewardId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {isActive ? "Desativar" : "Ativar"}
      </Button>
      {state && "error" in state && state.error && (
        <p className="mt-1 text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
