"use client";

import { useActionState, useState } from "react";
import { createRewardAction } from "@/actions/rewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";

export function CreateRewardForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createRewardAction(formData);
      if (result.success) setOpen(false);
      return result;
    },
    null
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Nova recompensa</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Cadastrar recompensa">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required placeholder="Vale-lanche" />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" placeholder="Descrição da recompensa" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="coinCost">Custo (moedas)</Label>
              <Input id="coinCost" name="coinCost" type="number" min="1" defaultValue={100} required />
            </div>
            <div>
              <Label htmlFor="stock">Estoque (vazio = ilimitado)</Label>
              <Input id="stock" name="stock" type="number" min="1" placeholder="Ilimitado" />
            </div>
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Salvando..." : "Cadastrar"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
