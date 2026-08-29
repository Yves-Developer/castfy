"use client";

import { cn } from "@castfy/ui/lib/utils";
import Image from "@/components/compat/image";
import { useState } from "react";

interface CachedImageProps {
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  onError?: () => void;
  onLoad?: () => void;
  src: string;
}

/**
 * CachedImage component - uses Next.js Image for optimized loading and caching.
 * Handles external images with proper error states.
 */
export function CachedImage({
  src,
  alt,
  className,
  loading = "lazy",
  onLoad,
  onError,
}: CachedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-card text-muted-foreground text-xs",
          className
        )}
      >
        Failed
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={cn("object-cover", className)}
      fill
      loading={loading}
      onError={() => {
        setHasError(true);
        onError?.();
      }}
      onLoad={onLoad}
      sizes="(max-width: 768px) 20vw, 10vw"
      src={src}
    />
  );
}
