import { AbsoluteFill, Composition, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { cameraAt, cameraStyle, planShots, type ZoomTrack } from './zoom';

/** A stretch of source footage to keep, in source time. */
export interface KeepSpec {
  id?: string;
  startMs: number;
  endMs: number;
}

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
  /**
   * Ranges of `src` to keep, played back to back with the gaps removed.
   *
   * Empty or absent means render `src` whole — which is what an already-cut
   * source needs, and what every export did before trimming moved in here.
   */
  keeps?: KeepSpec[];
  /**
   * Where to zoom, from the recording's clicks (see zoom.ts). Only applied to
   * untrimmed footage: cuts would move the events out from under their times.
   */
  zoom?: ZoomTrack | null;
}

const FPS = 30;

/**
 * Keep ranges as frame spans on both timelines at once.
 *
 * Both edges are rounded to absolute frames before subtracting, so consecutive
 * segments tile exactly: rounding each duration independently lets error
 * accumulate, and by the twentieth cut the video drifts against anything timed
 * to it.
 */
export function planSegments(keeps: KeepSpec[]) {
  const segments: { id: string; from: number; durationInFrames: number; trimBefore: number; trimAfter: number }[] = [];
  let timelineFrame = 0;

  for (const keep of keeps) {
    const trimBefore = Math.max(0, Math.round((keep.startMs / 1000) * FPS));
    const trimAfter = Math.max(trimBefore + 1, Math.round((keep.endMs / 1000) * FPS));
    const durationInFrames = trimAfter - trimBefore;

    segments.push({
      id: keep.id ?? `keep-${keep.startMs}`,
      from: timelineFrame,
      durationInFrames,
      trimBefore,
      trimAfter,
    });
    timelineFrame += durationInFrames;
  }

  return { segments, totalFrames: timelineFrame };
}

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
  keeps,
  zoom,
}: DemoProps) {
  const frame = useCurrentFrame();
  const behind = overlays.filter((o) => o.layer === 'back');
  const front = overlays.filter((o) => o.layer !== 'back');
  const segments = keeps?.length ? planSegments(keeps).segments : null;
  const shots = segments ? [] : planShots(zoom);
  const camera = cameraStyle(cameraAt((frame / FPS) * 1000, shots));

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
          {segments ? (
            segments.map((segment) => (
              <Sequence
                durationInFrames={segment.durationInFrames}
                from={segment.from}
                key={segment.id}
              >
                <OffthreadVideo
                  src={staticFile(src)}
                  style={{ width: '100%', display: 'block' }}
                  trimAfter={segment.trimAfter}
                  trimBefore={segment.trimBefore}
                />
              </Sequence>
            ))
          ) : (
            <div style={camera}>
              <OffthreadVideo src={staticFile(src)} style={{ width: '100%', display: 'block' }} />
            </div>
          )}
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
        keeps: [],
        zoom: null,
      }}
      durationInFrames={FPS}
      fps={FPS}
      height={1080}
      id="Demo"
      // Dimensions come from the caller: it knows the project's aspect ratio.
      // Duration too, except when keep ranges are trimming the source — then it
      // is the sum of the kept spans, computed the same way the Sequences are
      // laid out so the composition cannot outlast or truncate its own footage.
      calculateMetadata={({ props }) => ({
        durationInFrames: props.keeps?.length
          ? Math.max(1, planSegments(props.keeps).totalFrames)
          : Math.max(1, Math.round(props.durationInFrames)),
        width: Math.round(props.width),
        height: Math.round(props.height),
      })}
      width={1920}
    />
  );
}
