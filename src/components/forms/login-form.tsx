"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form-fields";
import Link from "next/link";
import { Medal } from "lucide-react";

const demoAccounts = [
  { email: "lucas@aluno.local", label: "Entrar como aluno (Lucas)" },
  { email: "mariana@responsavel.local", label: "Entrar como responsável" },
  { email: "admin@eduhub.local", label: "Entrar como diretor" },
];

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await loginAction(formData)) ?? null;
    },
    null
  );

  return (
    <Card className="w-full max-w-lg rounded-2xl border-2 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
          <Medal className="h-8 w-8 text-indigo-600" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl">Entrar no EduHub</CardTitle>
        <CardDescription className="text-base">
          Plataforma escolar com missões, moedas e recompensas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5" aria-label="Formulário de login">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue="lucas@aluno.local"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              defaultValue="demo123"
              required
              autoComplete="current-password"
            />
          </div>
          {state?.error && (
            <p
              className="rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-800"
              role="alert"
              aria-live="polite"
            >
              {state.error}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-base font-semibold text-slate-800">Acesso rápido (demo):</p>
          <div className="grid gap-2">
            {demoAccounts.map(({ email, label }) => (
              <form key={email} action={formAction}>
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="password" value="demo123" />
                <Button type="submit" variant="outline" className="w-full justify-start" disabled={pending}>
                  {label}
                </Button>
              </form>
            ))}
          </div>
          <p className="text-sm text-slate-600">Senha de todas as contas demo: <strong>demo123</strong></p>
        </div>

        <p className="mt-6 text-center text-base text-slate-600">
          Não tem conta?{" "}
          <Link href="/registro" className="font-semibold text-indigo-700 underline-offset-2 hover:underline">
            Registrar escola
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
