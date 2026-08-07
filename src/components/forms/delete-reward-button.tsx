"use client";

import { useActionState } from "react";
import { deleteRewardAction } from "@/actions/rewards";
import { Button } from "@/components/ui/button";

export function DeleteRewardButton({
  rewardId,
  hasRedemptions,
}: {
  rewardId: string;
  hasRedemptions: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean; message?: string } | null, formData: FormData) =>
      deleteRewardAction(formData),
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="rewardId" value={rewardId} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-red-600 hover:text-red-700"
      >
        {pending ? "..." : hasRedemptions ? "Desativar" : "Excluir"}
      </Button>
      {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      {state?.message && <p className="mt-1 text-xs text-amber-700">{state.message}</p>}
    </form>
  );
}
