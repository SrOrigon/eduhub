"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Medal,
  Settings,
  Target,
  User,
  Users,
  Menu,
  X,
  UserCog,
  Gift,
  Heart,
  Bell,
  PenLine,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, type UserRole } from "@/lib/constants";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const allNavItems = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard, roles: ["admin", "director"] },
  { href: "/dashboard/professor", label: "Minhas Turmas", icon: LayoutDashboard, roles: ["teacher"] },
  { href: "/dashboard/alunos", label: "Alunos", icon: Users, roles: ["admin", "director", "teacher"] },
  { href: "/dashboard/turmas", label: "Turmas", icon: GraduationCap, roles: ["admin", "director", "teacher"] },
  { href: "/dashboard/professores", label: "Professores", icon: UserCog, roles: ["admin", "director"] },
  { href: "/dashboard/notas", label: "Notas", icon: BookOpen, roles: ["admin", "director", "teacher"] },
  { href: "/dashboard/frequencia", label: "Frequência", icon: ClipboardList, roles: ["admin", "director", "teacher"] },
  { href: "/dashboard/exercicios", label: "Exercícios", icon: PenLine, roles: ["admin", "director", "teacher", "student"] },
  { href: "/dashboard/gamificacao", label: "Gamificação", icon: Target, roles: ["admin", "director", "teacher"] },
  { href: "/dashboard/loja", label: "Loja de Recompensas", icon: Gift, roles: ["admin", "director", "teacher", "student"] },
  { href: "/dashboard/responsaveis", label: "Responsáveis", icon: Heart, roles: ["admin", "director"] },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3, roles: ["admin", "director", "teacher"] },
  { href: "/dashboard/aluno", label: "Meu Perfil", icon: User, roles: ["student"] },
  { href: "/dashboard/busca", label: "Busca", icon: BookOpen, roles: ["student", "parent"] },
  { href: "/dashboard/notificacoes", label: "Notificações", icon: Bell, roles: ["admin", "director", "teacher", "student", "parent"] },
  { href: "/dashboard/responsavel", label: "Meus Filhos", icon: Heart, roles: ["parent"] },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings, roles: ["admin", "director"] },
];

function NavLinks({
  pathname,
  role,
  kidFriendly,
  onNavigate,
}: {
  pathname: string;
  role: UserRole;
  kidFriendly: boolean;
  onNavigate?: () => void;
}) {
  const items = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <nav aria-label="Menu principal" className="space-y-1 p-3 sm:p-4">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "nav-link flex items-center gap-3 rounded-xl font-medium transition-colors",
              kidFriendly ? "min-h-12 px-4 py-3 text-base" : "min-h-11 px-3 py-2.5 text-sm",
              active
                ? "bg-indigo-100 text-indigo-800 ring-2 ring-indigo-200"
                : "text-slate-700 hover:bg-slate-100"
            )}
          >
            <Icon className={cn("shrink-0", kidFriendly ? "h-6 w-6" : "h-5 w-5")} aria-hidden="true" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  pathname,
  userName,
  schoolName,
  role,
  kidFriendly,
  mobileOpen,
  onMobileOpenChange,
}: {
  pathname: string;
  userName: string;
  schoolName: string;
  role: UserRole;
  kidFriendly: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => onMobileOpenChange(false)}
            aria-hidden="true"
          />
          <aside
            id="mobile-sidebar"
            className="relative flex h-full w-[min(20rem,90vw)] flex-col bg-white shadow-xl"
            aria-label="Menu lateral"
          >
            <button
              type="button"
              className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-lg"
              onClick={() => onMobileOpenChange(false)}
              aria-label="Fechar menu"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
            <SidebarContent
              pathname={pathname}
              userName={userName}
              schoolName={schoolName}
              role={role}
              kidFriendly={kidFriendly}
              onNavigate={() => onMobileOpenChange(false)}
            />
          </aside>
        </div>
      )}

      <aside
        className="hidden h-dvh w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex xl:w-72"
        aria-label="Menu lateral"
      >
        <SidebarContent
          pathname={pathname}
          userName={userName}
          schoolName={schoolName}
          role={role}
          kidFriendly={kidFriendly}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  userName,
  schoolName,
  role,
  kidFriendly,
  onNavigate,
}: {
  pathname: string;
  userName: string;
  schoolName: string;
  role: UserRole;
  kidFriendly: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-4 sm:px-6">
        <Medal className="h-8 w-8 shrink-0 text-indigo-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-900">EduHub</p>
          <p className="truncate text-sm text-slate-600">{ROLE_LABELS[role]}</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <NavLinks pathname={pathname} role={role} kidFriendly={kidFriendly} onNavigate={onNavigate} />
      </div>
      <div className="shrink-0 border-t border-slate-200 p-4">
        <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
        <p className="truncate text-sm text-slate-600">{schoolName}</p>
        <form action={logoutAction} className="mt-3">
          <Button type="submit" variant="outline" size={kidFriendly ? "lg" : "default"} className="w-full">
            Sair
          </Button>
        </form>
      </div>
    </div>
  );
}
