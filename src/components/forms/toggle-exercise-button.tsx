"use client";

import { useActionState } from "react";
import { toggleExerciseAction } from "@/actions/exercises";
import { Button } from "@/components/ui/button";

export function ToggleExerciseButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await toggleExerciseAction(formData);
      return null;
    },
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {isActive ? "Desativar" : "Reativar"}
      </Button>
    </form>
  );
}
