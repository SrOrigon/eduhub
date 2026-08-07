"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProfileAvatar({
  name,
  avatarUrl,
  size = "lg",
  className,
  onImageError,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onImageError?: () => void;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-4xl",
  };

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  const showImage = Boolean(avatarUrl) && avatarUrl !== failedUrl;

  if (showImage) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full ring-4 ring-white shadow-md",
          sizes[size],
          className
        )}
      >
        <Image
          src={avatarUrl!}
          alt={`Foto de ${name}`}
          fill
          className="object-cover"
          unoptimized
          onError={() => {
            setFailedUrl(avatarUrl!);
            onImageError?.();
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-[color:var(--school-primary,#4f46e5)] font-bold text-white ring-4 ring-white shadow-md",
        sizes[size],
        className
      )}
      aria-hidden={initials ? true : undefined}
      title={name}
    >
      {initials || "?"}
    </div>
  );
}
