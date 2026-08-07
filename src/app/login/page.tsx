import { AuthPortalPicker } from "@/components/auth/auth-portal-picker";

export default function LoginHubPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4 py-8">
      <AuthPortalPicker mode="login" />
    </main>
  );
}
