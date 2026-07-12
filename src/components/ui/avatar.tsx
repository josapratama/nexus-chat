"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  className?: string;
}

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || fallback}
        className={cn("h-8 w-8 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium",
        className,
      )}
    >
      {fallback.charAt(0).toUpperCase()}
    </div>
  );
}
