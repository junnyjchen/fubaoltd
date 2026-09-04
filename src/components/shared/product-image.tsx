'use client';

import { useEffect, useState } from 'react';
import { TalismanSVG, getTalismanVariant } from '@/components/shared/talisman-svg';

/**
 * Product image renderer with graceful fallback.
 *
 * Only image keys uploaded through the admin console (prefix `products/`) are
 * treated as real photos: they resolve to a short-lived signed URL via
 * GET /api/images/[key]. Everything else — seed keys like
 * `talisman-protection.jpg`, missing keys — renders the TalismanSVG
 * illustration so existing products keep their look untouched.
 */
interface ProductImageProps {
  imageKey?: string | null;
  slug: string;
  className?: string;
  svgClassName?: string;
  alt?: string;
}

export function isUploadedPhoto(imageKey?: string | null): boolean {
  return typeof imageKey === 'string' && imageKey.startsWith('products/');
}

export function ProductImage({
  imageKey,
  slug,
  className,
  svgClassName,
  alt,
}: ProductImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const usable = isUploadedPhoto(imageKey);

  useEffect(() => {
    if (!usable || !imageKey) {
      setSignedUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/images/${encodeURIComponent(imageKey)}`);
        if (!res.ok) return;
        const json = (await res.json()) as {
          success?: boolean;
          placeholder?: boolean;
          url?: string;
        };
        if (!cancelled && json.success && !json.placeholder && json.url) {
          setSignedUrl(json.url);
        }
      } catch {
        // network failure -> keep SVG fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageKey, usable]);

  if (usable && signedUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={signedUrl}
        alt={alt ?? slug}
        className={className}
        loading="lazy"
        data-image-key={imageKey}
      />
    );
  }

  return (
    <span data-image-key={imageKey} className="contents">
      <TalismanSVG
        variant={getTalismanVariant(slug)}
        className={svgClassName ?? className}
      />
    </span>
  );
}
