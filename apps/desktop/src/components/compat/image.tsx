import type { CSSProperties, ImgHTMLAttributes } from 'react';

type NextImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> & {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
  sizes?: string;
};

/**
 * Drop-in for next/image.
 *
 * There is no image optimizer here and no need for one — everything the desktop
 * app renders is already on local disk. `fill` is the one prop with real
 * behaviour, and it maps onto absolute positioning the same way Next does it.
 */
export default function Image({
  fill,
  priority,
  quality,
  unoptimized,
  style,
  ...rest
}: NextImageProps) {
  void priority;
  void quality;
  void unoptimized;

  const fillStyle: CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }
    : {};

  return (
    // biome-ignore lint/a11y/useAltText: alt is required by the prop type above
    <img decoding="async" loading="lazy" style={{ ...fillStyle, ...style }} {...rest} />
  );
}
