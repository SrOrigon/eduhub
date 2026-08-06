import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  children,
  className,
  backHref,
  backLabel = "Voltar",
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className={cn("page-header", className)}>
      <div className="min-w-0 flex-1 space-y-2">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-subtitle mt-1">{description}</p>}
        </div>
      </div>
      {children && <div className="page-header-actions shrink-0">{children}</div>}
    </header>
  );
}
