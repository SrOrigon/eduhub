"use client";

import { useActionState, useState } from "react";
import { updateRewardCategoryAction } from "@/actions/reward-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";

export interface RewardCategoryEditData {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

export function EditRewardCategoryForm({ category }: { category: RewardCategoryEditData }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await updateRewardCategoryAction(formData);
      if (result.success) setOpen(false);
      return result;
    },
    null
  );

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Editar
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Editar categoria">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="categoryId" value={category.id} />
          <div>
            <Label htmlFor={`cat-edit-name-${category.id}`}>Nome</Label>
            <Input id={`cat-edit-name-${category.id}`} name="name" required defaultValue={category.name} />
          </div>
          <div>
            <Label htmlFor={`cat-edit-desc-${category.id}`}>Descrição</Label>
            <Textarea
              id={`cat-edit-desc-${category.id}`}
              name="description"
              rows={2}
              defaultValue={category.description ?? ""}
            />
          </div>
          <div>
            <Label htmlFor={`cat-edit-order-${category.id}`}>Ordem na vitrine</Label>
            <Input
              id={`cat-edit-order-${category.id}`}
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={category.sortOrder}
            />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
