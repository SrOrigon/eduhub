"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type UserRole } from "@/lib/constants";
import { SearchBar } from "@/components/layout/search-bar";
import { NotificationBell } from "@/components/layout/notification-bell";

export function Header({
  userName,
  schoolName,
  role,
  onMenuClick,
}: {
  userName: string;
  schoolName: string;
  role: UserRole;
  onMenuClick: () => void;
}) {
  const showSearch =
    role === "admin" || role === "director" || role === "teacher" || role === "parent" || role === "student";
  const firstName = userName.split(" ")[0];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 safe-area-top">
      <div className="flex min-h-14 flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:gap-3 sm:px-4 lg:min-h-16 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white lg:hidden"
            onClick={onMenuClick}
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1">
            {showSearch ? (
              <>
                <div className="hidden md:block">
                  <SearchBar className="max-w-full lg:max-w-md" />
                </div>
                <div className="md:hidden">
                  <p className="truncate text-sm font-semibold text-slate-900">{schoolName}</p>
                  <p className="truncate text-xs text-slate-600">Olá, {firstName}!</p>
                </div>
              </>
            ) : (
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900 sm:text-lg">{schoolName}</p>
                <p className="truncate text-sm text-slate-600">Olá, {firstName}!</p>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {showSearch && (
              <Link
                href="/dashboard/busca"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white md:hidden"
                aria-label="Abrir busca"
              >
                <Search className="h-5 w-5 text-slate-600" aria-hidden="true" />
              </Link>
            )}
            <NotificationBell />
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {ROLE_LABELS[role]}
            </Badge>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--school-primary)] text-sm font-bold text-white sm:h-11 sm:w-11 sm:text-base"
              aria-hidden="true"
            >
              {userName.charAt(0)}
            </div>
            <span className="sr-only">Usuário: {userName}</span>
          </div>
        </div>

        {showSearch && (
          <div className="w-full md:hidden">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  );
}
