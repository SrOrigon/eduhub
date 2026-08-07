const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
export const AVATAR_MAX_BYTES = 320_000;

export function isAllowedAvatarMime(mime: string) {
  return ALLOWED_MIME.has(mime);
}

export function isValidExternalAvatarUrl(url: string) {
  return /^https?:\/\/.+/i.test(url.trim());
}

export function isStoredAvatar(value: string | null | undefined) {
  if (!value) return false;
  return value.startsWith("data:image/") || value.startsWith("/uploads/") || isValidExternalAvatarUrl(value);
}

export async function fileToAvatarDataUrl(file: File): Promise<string | { error: string }> {
  if (!isAllowedAvatarMime(file.type)) {
    return { error: "Use JPG, PNG, WebP ou GIF." };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { error: "A foto deve ter no máximo 300 KB após compressão." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  return `data:${file.type};base64,${base64}`;
}
