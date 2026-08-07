"use client";

import { useActionState, useState } from "react";
import { updateRewardAction } from "@/actions/rewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Select, Textarea } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import type { ShopCategoryOption } from "@/components/forms/create-reward-form";

export interface RewardEditData {
  id: string;
  name: string;
  description: string | null;
  coinCost: number;
  stock: number | null;
  isActive: boolean;
  categoryId: string | null;
}

export function EditRewardForm({
  reward,
  categories,
}: {
  reward: RewardEditData;
  categories: ShopCategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await updateRewardAction(formData);
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
      <Modal open={open} onClose={() => setOpen(false)} title="Editar item da loja">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="rewardId" value={reward.id} />
          <div>
            <Label htmlFor={`edit-cat-${reward.id}`}>Categoria</Label>
            <Select id={`edit-cat-${reward.id}`} name="categoryId" defaultValue={reward.categoryId ?? ""}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} disabled={!c.isActive && c.id !== reward.categoryId}>
                  {c.name}{!c.isActive ? " (inativa)" : ""}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`edit-name-${reward.id}`}>Nome do prêmio</Label>
            <Input id={`edit-name-${reward.id}`} name="name" required defaultValue={reward.name} />
          </div>
          <div>
            <Label htmlFor={`edit-desc-${reward.id}`}>Descrição</Label>
            <Textarea
              id={`edit-desc-${reward.id}`}
              name="description"
              rows={2}
              defaultValue={reward.description ?? ""}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`edit-cost-${reward.id}`}>Preço (moedas)</Label>
              <Input
                id={`edit-cost-${reward.id}`}
                name="coinCost"
                type="number"
                min="1"
                required
                defaultValue={reward.coinCost}
              />
            </div>
            <div>
              <Label htmlFor={`edit-stock-${reward.id}`}>Estoque (vazio = ilimitado)</Label>
              <Input
                id={`edit-stock-${reward.id}`}
                name="stock"
                type="number"
                min="0"
                defaultValue={reward.stock ?? ""}
                placeholder="Ilimitado"
              />
            </div>
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
