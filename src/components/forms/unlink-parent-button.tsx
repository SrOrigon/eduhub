"use client";

import { useActionState } from "react";
import { unlinkParentStudentAction } from "@/actions/parents";
import { Button } from "@/components/ui/button";

export function UnlinkParentButton({ linkId, studentName }: { linkId: string; studentName: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      if (!confirm(`Remover vínculo com ${studentName}?`)) return { error: "Cancelado." };
      return await unlinkParentStudentAction(formData);
    },
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="linkId" value={linkId} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending} className="text-red-600">
        {pending ? "..." : "Remover"}
      </Button>
      {state?.error && state.error !== "Cancelado." && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
