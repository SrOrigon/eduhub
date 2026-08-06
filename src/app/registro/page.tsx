"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form-fields";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await registerAction(formData)) ?? null;
    },
    null
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4 py-8">
      <Card className="w-full max-w-lg rounded-2xl border-2">
        <CardHeader>
          <CardTitle>Registrar escola</CardTitle>
          <CardDescription>Crie sua conta de diretor e escola gratuitamente</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="schoolName">Nome da escola</Label>
              <Input id="schoolName" name="schoolName" required placeholder="Escola Municipal..." />
            </div>
            <div>
              <Label htmlFor="fullName">Seu nome</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" minLength={6} required />
            </div>
            <input type="hidden" name="role" value="director" />
            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Criando..." : "Criar conta"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link href="/login" className="text-indigo-600 hover:underline">
              Já tenho conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
