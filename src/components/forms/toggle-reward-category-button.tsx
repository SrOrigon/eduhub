"use client";

import { useActionState } from "react";
import { toggleRewardCategoryAction } from "@/actions/reward-categories";
import { Button } from "@/components/ui/button";

export function ToggleRewardCategoryButton({
  categoryId,
  isActive,
}: {
  categoryId: string;
  isActive: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => toggleRewardCategoryAction(formData),
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="categoryId" value={categoryId} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {isActive ? "Desativar" : "Ativar"}
      </Button>
      {state && typeof state === "object" && "error" in state && state.error && (
        <p className="text-xs text-red-600">{String(state.error)}</p>
      )}
    </form>
  );
}
