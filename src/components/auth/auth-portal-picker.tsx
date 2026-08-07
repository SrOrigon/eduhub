import Link from "next/link";
import { Building2, GraduationCap, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal } from "lucide-react";

const portals = [
  {
    href: "/login/escola",
    registerHref: "/registro/escola",
    icon: Building2,
    title: "Instituição",
    description: "Direção e gestão da escola — turmas, relatórios e configurações.",
    color: "border-indigo-200 bg-indigo-50/50 hover:border-indigo-400",
    iconColor: "text-indigo-600 bg-indigo-100",
  },
  {
    href: "/login/professor",
    registerHref: "/registro/professor",
    icon: GraduationCap,
    title: "Professor",
    description: "Cadastre turmas, publique exercícios e acompanhe entregas.",
    color: "border-emerald-200 bg-emerald-50/50 hover:border-emerald-400",
    iconColor: "text-emerald-600 bg-emerald-100",
  },
  {
    href: "/login/aluno",
    registerHref: "/registro/aluno",
    icon: UserRound,
    title: "Aluno",
    description: "Veja tarefas, entregue exercícios e acompanhe XP e missões.",
    color: "border-amber-200 bg-amber-50/50 hover:border-amber-400",
    iconColor: "text-amber-600 bg-amber-100",
  },
];

export function AuthPortalPicker({ mode }: { mode: "login" | "register" }) {
  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
          <Medal className="h-7 w-7 text-indigo-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === "login" ? "Entrar no EduHub" : "Criar conta no EduHub"}
        </h1>
        <p className="mt-2 text-slate-600">Escolha seu tipo de acesso</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {portals.map((p) => {
          const Icon = p.icon;
          const href = mode === "login" ? p.href : p.registerHref;
          return (
            <Link key={p.href} href={href} className="block min-h-11">
              <Card className={`h-full border-2 transition-colors ${p.color}`}>
                <CardHeader className="pb-2 text-center">
                  <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${p.iconColor}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                  <CardDescription className="text-sm">{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4 text-center">
                  <span className="text-sm font-semibold text-[color:var(--school-primary,#4f46e5)]">
                    {mode === "login" ? "Entrar →" : "Cadastrar →"}
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>
            Não tem conta?{" "}
            <Link href="/registro" className="font-semibold text-indigo-700 hover:underline">
              Cadastre-se
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-indigo-700 hover:underline">
              Entrar
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
