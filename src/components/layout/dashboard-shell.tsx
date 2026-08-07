"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SchoolThemeProvider } from "@/components/school/school-theme-provider";
import { isKidFriendlyRole, type UserRole } from "@/lib/constants";
import type { SchoolSettings } from "@/lib/school-settings";

export function DashboardShell({
  children,
  userName,
  schoolName,
  role,
  branding,
  permissions,
}: {
  children: React.ReactNode;
  userName: string;
  schoolName: string;
  role: UserRole;
  branding: SchoolSettings["branding"];
  permissions: SchoolSettings["permissions"];
}) {
  const pathname = usePathname();
  const kidFriendly = isKidFriendlyRole(role);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <SchoolThemeProvider branding={branding}>
      <div
        className="app-shell bg-[#f8fafc]"
        data-audience={kidFriendly ? "student" : "staff"}
      >
        <a href="#main-content" className="skip-link">
          Ir para o conteúdo principal
        </a>

        <Sidebar
          pathname={pathname}
          userName={userName}
          schoolName={schoolName}
          role={role}
          kidFriendly={kidFriendly}
          permissions={permissions}
          tagline={branding.tagline}
          mobileOpen={mobileMenuOpen}
          onMobileOpenChange={setMobileMenuOpen}
        />

        <div className="app-content">
          <Header
            userName={userName}
            schoolName={schoolName}
            role={role}
            onMenuClick={() => setMobileMenuOpen(true)}
          />
          <main
            id="main-content"
            tabIndex={-1}
            aria-label="Conteúdo principal"
            className="app-main focus:outline-none"
          >
            {children}
          </main>
        </div>
      </div>
    </SchoolThemeProvider>
  );
}
