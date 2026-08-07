"use client";

import { useActionState } from "react";
import { deleteRewardCategoryAction } from "@/actions/reward-categories";
import { Button } from "@/components/ui/button";

export function DeleteRewardCategoryButton({
  categoryId,
  hasItems,
}: {
  categoryId: string;
  hasItems: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean; message?: string } | null, formData: FormData) =>
      deleteRewardCategoryAction(formData),
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="categoryId" value={categoryId} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-red-600 hover:text-red-700"
      >
        {pending ? "..." : hasItems ? "Desativar" : "Excluir"}
      </Button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.message && <p className="text-xs text-amber-700">{state.message}</p>}
    </form>
  );
}
