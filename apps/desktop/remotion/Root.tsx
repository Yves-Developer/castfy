import { AbsoluteFill, Composition, Img, OffthreadVideo, staticFile } from 'remotion';

export interface OverlaySpec {
  src: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  blur: number;
  layer: 'front' | 'back';
}

export interface DemoProps extends Record<string, unknown> {
  /** Path relative to the library root, e.g. "6b35b0f3/demo-clean.webm". */
  src: string;
  /**
   * Resolved CSS for the background — a colour or gradient string. Resolving it
   * in the app rather than here keeps one source of truth for the gradient
   * catalogue, and keeps this bundle free of app-side imports.
   */
  backgroundCss: string;
  /** Library-relative path to a background image, when the background is one. */
  backgroundImage: string | null;
  overlays: OverlaySpec[];
  /** Fraction of the frame left as margin around the video. */
  padding: number;
  radius: number;
  /** Computed in the main process, where the media can be probed. */
  durationInFrames: number;
  width: number;
  height: number;
}

const FPS = 30;

function Overlay({ overlay }: { overlay: OverlaySpec }) {
  const flips = `scaleX(${overlay.flipX ? -1 : 1}) scaleY(${overlay.flipY ? -1 : 1})`;
  return (
    <Img
      src={staticFile(overlay.src)}
      style={{
        position: 'absolute',
        left: overlay.x,
        top: overlay.y,
        width: overlay.size,
        opacity: overlay.opacity,
        transform: `rotate(${overlay.rotation}deg) ${flips}`,
        filter: overlay.blur > 0 ? `blur(${overlay.blur}px)` : undefined,
      }}
    />
  );
}

/**
 * The exported frame: background, the recording inset on top of it, and any
 * overlays. Mirrors what the studio previews, so an export looks like what was
 * being edited.
 */
export function Demo({
  src,
  backgroundCss,
  backgroundImage,
  overlays,
  padding,
  radius,
}: DemoProps) {
  const behind = overlays.filter((o) => o.layer === 'back');
  const front = overlays.filter((o) => o.layer !== 'back');

  return (
    <AbsoluteFill style={{ background: backgroundCss }}>
      {backgroundImage ? (
        <Img
          src={staticFile(backgroundImage)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : null}

      {behind.map((overlay) => (
        <Overlay key={overlay.src + overlay.x} overlay={overlay} />
      ))}

      <AbsoluteFill style={{ padding: `${padding}%`, justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: '100%',
            borderRadius: radius,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,.35)',
          }}
        >
          {/* OffthreadVideo, not Video: rendering extracts frames with ffmpeg
              rather than relying on browser playback timing. */}
          <OffthreadVideo src={staticFile(src)} style={{ width: '100%', display: 'block' }} />
        </div>
      </AbsoluteFill>

      {front.map((overlay) => (
        <Overlay key={overlay.src + overlay.x} overlay={overlay} />
      ))}
    </AbsoluteFill>
  );
}

export function RemotionRoot() {
  return (
    <Composition
      component={Demo}
      defaultProps={{
        src: '',
        backgroundCss: '#0f172a',
        backgroundImage: null,
        overlays: [],
        padding: 4,
        radius: 12,
        durationInFrames: FPS,
        width: 1920,
        height: 1080,
      }}
      durationInFrames={FPS}
      fps={FPS}
      height={1080}
      id="Demo"
      // Duration and dimensions come from the caller: the main process knows the
      // recording's length and the project's aspect ratio, and probing again in
      // the browser is slower and can disagree with ffmpeg.
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.max(1, Math.round(props.durationInFrames)),
        width: Math.round(props.width),
        height: Math.round(props.height),
      })}
      width={1920}
    />
  );
}
