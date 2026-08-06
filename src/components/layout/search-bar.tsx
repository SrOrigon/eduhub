"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = new FormData(form).get("q")?.toString().trim();
    if (q) router.push(`/dashboard/busca?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full", className)} role="search">
      <label htmlFor="global-search" className="sr-only">
        Buscar alunos ou turmas
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 sm:h-5 sm:w-5"
        aria-hidden="true"
      />
      <Input
        id="global-search"
        placeholder="Buscar..."
        className="pl-9 sm:pl-10"
        name="q"
        autoComplete="off"
      />
    </form>
  );
}
