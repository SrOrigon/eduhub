"use client";

import { useActionState } from "react";
import { requestMissionCompletionAction } from "@/actions/crud";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function RequestMissionButton({
  missionId,
  alreadyRequested,
}: {
  missionId: string;
  alreadyRequested?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await requestMissionCompletionAction(formData);
    },
    null
  );

  if (state?.success || alreadyRequested) {
    return (
      <p className="text-base font-bold text-indigo-700" role="status">
        Pedido enviado! O professor vai confirmar em breve.
      </p>
    );
  }

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="missionId" value={missionId} />
        <Button type="submit" size="lg" disabled={pending} className="gap-2">
          <Send className="h-5 w-5" aria-hidden="true" />
          {pending ? "Enviando..." : "Já fiz! Pedir confirmação"}
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
