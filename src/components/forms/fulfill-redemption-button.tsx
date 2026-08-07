"use client";

import { useActionState } from "react";
import { fulfillRedemptionAction } from "@/actions/rewards";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function FulfillRedemptionButton({ redemptionId }: { redemptionId: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await fulfillRedemptionAction(formData);
    },
    null
  );

  if (state?.success) {
    return <span className="text-sm font-medium text-emerald-700">Entregue!</span>;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="redemptionId" value={redemptionId} />
      <Button type="submit" size="sm" disabled={pending} className="gap-1">
        <Check className="h-4 w-4" aria-hidden="true" />
        {pending ? "..." : "Marcar entregue"}
      </Button>
      {state?.error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
