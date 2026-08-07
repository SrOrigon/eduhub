import { RoleLoginForm } from "@/components/auth/role-login-form";

export default function LoginResponsavelPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4 py-8">
      <RoleLoginForm portal="responsavel" />
    </main>
  );
}
