import { getSessionUser } from "@/lib/auth";
import { getSchool } from "@/lib/queries";
import { parseSchoolSettings } from "@/lib/school-settings";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const school = await getSchool(user);
  const settings = parseSchoolSettings(school?.settings);

  return (
    <DashboardShell
      userName={user.fullName}
      schoolName={school?.name ?? "Sem escola"}
      role={user.role}
      branding={settings.branding}
      permissions={settings.permissions}
    >
      {children}
    </DashboardShell>
  );
}
