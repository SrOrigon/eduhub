"use client";

import { useActionState } from "react";
import { completeMissionAction } from "@/actions/crud";
import { Button } from "@/components/ui/button";

export function CompleteMissionButton({
  studentId,
  missionId,
  completed,
}: {
  studentId: string;
  missionId: string;
  completed: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await completeMissionAction(formData);
    },
    null
  );

  if (completed) {
    return (
      <p className="text-base font-bold text-emerald-700" role="status">
        Missão concluída!
      </p>
    );
  }

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="studentId" value={studentId} />
        <input type="hidden" name="missionId" value={missionId} />
        <Button type="submit" size="lg" disabled={pending} aria-label="Marcar missão como concluída">
          {pending ? "Salvando..." : "Concluir missão"}
        </Button>
      </form>
      {state?.error && (
        <p className="mt-2 text-base font-medium text-red-700" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
