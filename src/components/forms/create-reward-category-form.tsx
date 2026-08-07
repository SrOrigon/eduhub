"use client";

import { useActionState, useState } from "react";
import { createRewardCategoryAction } from "@/actions/reward-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";

export function CreateRewardCategoryForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createRewardCategoryAction(formData);
      if (result.success) setOpen(false);
      return result;
    },
    null
  );

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        + Nova categoria
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nova categoria da loja">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="cat-name">Nome</Label>
            <Input id="cat-name" name="name" required placeholder="Ex.: Lanches" />
          </div>
          <div>
            <Label htmlFor="cat-description">Descrição (opcional)</Label>
            <Textarea id="cat-description" name="description" rows={2} placeholder="O que entra nesta categoria?" />
          </div>
          <div>
            <Label htmlFor="cat-sortOrder">Ordem na vitrine</Label>
            <Input id="cat-sortOrder" name="sortOrder" type="number" min="0" defaultValue={0} />
            <p className="mt-1 text-xs text-slate-500">Menor número aparece primeiro para os alunos.</p>
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Salvando..." : "Criar categoria"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
