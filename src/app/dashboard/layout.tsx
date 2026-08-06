import { getSessionUser } from "@/lib/auth";
import { getSchool } from "@/lib/queries";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const school = await getSchool(user);

  return (
    <DashboardShell
      userName={user.fullName}
      schoolName={school?.name ?? "Sem escola"}
      role={user.role}
    >
      {children}
    </DashboardShell>
  );
}
