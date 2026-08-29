/**
 * Asset URL resolution.
 *
 * The dashboard resolves these against Cloudflare R2, falling back to local
 * `public/` when the bucket is not configured. The desktop app is always the
 * fallback case: assets ship inside the app, so nothing here should ever reach
 * the network — a background picker that needs a connection is a bug, not a
 * degraded mode.
 *
 * The `getR2*` names are kept so the ported components are untouched.
 *
 * This also fixes a real crash: the dashboard read `process.env` here, which
 * does not exist in a browser bundle and threw a ReferenceError on first call.
 */

/**
 * R2 keys are bucket-relative ("backgrounds/mac/foo.jpg") while the shipped
 * files sit at the public root ("/mac/foo.jpg"), so the prefixes are remapped.
 */
const PREFIX_MAP: Record<string, string> = {
  'backgrounds/': '',
  'overlays/shadow/': 'overlay-shadow/',
  'overlays/arrow/': 'overlay/',
};

function mapToLocal(assetPath: string): string {
  const clean = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;

  for (const [remotePrefix, localPrefix] of Object.entries(PREFIX_MAP)) {
    if (clean.startsWith(remotePrefix)) {
      return `/${localPrefix}${clean.slice(remotePrefix.length)}`;
    }
  }

  return `/${clean}`;
}

/** Resolves an asset key to a path served from the app's own bundle. */
export function getR2PublicUrl(assetPath: string): string {
  return mapToLocal(assetPath);
}

/**
 * Same, but passes through sources that are already resolvable — remote URLs a
 * user pasted, and the blob/data URLs the editor creates for local uploads.
 */
export function getR2ImageUrl(options: {
  src: string;
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}): string {
  const { src } = options;

  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('blob:') ||
    src.startsWith('data:')
  ) {
    return src;
  }

  return getR2PublicUrl(src);
}

/** Assets are bundled, so there is never a remote bucket to configure. */
export function isR2Configured(): boolean {
  return false;
}
