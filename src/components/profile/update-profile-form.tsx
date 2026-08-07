"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form-fields";
import { ProfileAvatar } from "@/components/profile/profile-avatar";

function isValidAvatarUrl(value: string) {
  return /^https?:\/\/.+/i.test(value.trim());
}

export function UpdateProfileForm({
  fullName: initialName,
  avatarUrl: initialAvatar,
}: {
  fullName: string;
  avatarUrl: string | null;
}) {
  const [fullName, setFullName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar ?? "");
  const [previewLoadFailed, setPreviewLoadFailed] = useState(false);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean; message?: string } | null, formData: FormData) =>
      updateProfileAction(formData),
    null
  );

  const previewName = fullName.trim() || initialName;
  const trimmedAvatar = avatarUrl.trim();

  const avatarWarning = useMemo(() => {
    if (!trimmedAvatar) return null;
    if (!isValidAvatarUrl(trimmedAvatar)) {
      return "Informe uma URL válida começando com http:// ou https://";
    }
    if (previewLoadFailed) {
      return "Não foi possível carregar a imagem. Verifique o link ou deixe o campo vazio.";
    }
    return null;
  }, [trimmedAvatar, previewLoadFailed]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-start">
        <ProfileAvatar
          name={previewName}
          avatarUrl={trimmedAvatar && isValidAvatarUrl(trimmedAvatar) ? trimmedAvatar : null}
          size="lg"
          onImageError={() => setPreviewLoadFailed(true)}
        />
        <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left">
          <p className="text-sm font-medium text-slate-900">Prévia da foto</p>
          <p className="text-xs text-slate-500">
            Atualiza ao salvar. Sem URL válida, usamos suas iniciais.
          </p>
          {avatarWarning && (
            <p className="text-xs text-amber-700" role="status">
              {avatarWarning}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="profile-fullName">Nome completo</Label>
        <Input
          id="profile-fullName"
          name="fullName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </div>
      <div>
        <Label htmlFor="profile-avatarUrl">Foto de perfil (URL)</Label>
        <Input
          id="profile-avatarUrl"
          name="avatarUrl"
          type="url"
          inputMode="url"
          placeholder="https://exemplo.com/foto.jpg"
          value={avatarUrl}
          onChange={(e) => {
            setAvatarUrl(e.target.value);
            setPreviewLoadFailed(false);
          }}
          aria-invalid={avatarWarning ? true : undefined}
          aria-describedby={avatarWarning ? "profile-avatar-hint" : undefined}
        />
        <p id="profile-avatar-hint" className="mt-1 text-xs text-slate-500">
          Cole o link de uma imagem pública. Deixe vazio para usar iniciais.
        </p>
      </div>
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && state.message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto" size="lg">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
