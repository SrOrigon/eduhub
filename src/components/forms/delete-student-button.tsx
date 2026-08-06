"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { deleteStudentAction } from "@/actions/crud";
import { Button } from "@/components/ui/button";

export function DeleteStudentButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      if (!confirm(`Excluir o aluno ${studentName}? Esta ação não pode ser desfeita.`)) {
        return { error: "Cancelado." };
      }
      const result = await deleteStudentAction(formData);
      if (result.success) router.push("/dashboard/alunos");
      return result;
    },
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="studentId" value={studentId} />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        {pending ? "Excluindo..." : "Excluir aluno"}
      </Button>
      {state?.error && state.error !== "Cancelado." && (
        <p className="mt-1 text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
