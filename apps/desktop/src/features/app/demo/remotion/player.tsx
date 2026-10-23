"use client";
import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useState } from "react";
import { useLive, useRecordingBrowser } from "@/lib/live-view";
import { useBackgroundStore } from "@/lib/store";
import { LiveView } from "./live-view";
import { StudioComposition } from "./comp";
import { calculateMetadata, trimBeforeFor } from "./meta";

/** How long after a pause the timeline is moved to where the video stopped. */
const ALIGN_AFTER_PAUSE_MS = 150;
const FPS = 30;

/**
 * Plays the preview's video on its own clock.
 *
 * Remotion's player advances its timeline by the clock and drops the frames
 * it was too busy to draw, so on a busy or slow Mac the timeline falls behind.
 * Its <Video> then seeks the video back to the timeline, which replayed the
 * start of voiceover lines ("demo, demo"). The composition plays a plain
 * video instead (comp.tsx), and draws its zoom and pointer at the video's
 * time; this starts and stops it with the player, and moves it when the user
 * seeks. Nothing seeks it while it plays, so the sound never jumps.
 *
 * Moving the timeline while it plays would pause and resume the player, so
 * the two are only lined up when it stops: the timeline then moves to where
 * the video is.
 */
function useVideoClock(
  ref: React.RefObject<PlayerRef | null>,
  url: string | null
) {
  useEffect(() => {
    if (!url) {
      return;
    }
    const trimBefore = trimBeforeFor(url);
    let player: PlayerRef | null = null;
    /** The player's speed: it has no getter, only the event. */
    let rate = 1;
    let alignTimer: ReturnType<typeof setTimeout> | undefined;
    /** The frame this hook last moved the timeline to: its report is not a user seek. */
    let aligned: number | null = null;
    const videoOf = () =>
      player
        ?.getContainerNode()
        ?.querySelector<HTMLVideoElement>("video[data-preview-clock]");
    const frameOf = (video: HTMLVideoElement) =>
      Math.max(0, Math.round(video.currentTime * FPS) - trimBefore);

    const onPlay = () => {
      clearTimeout(alignTimer);
      const video = videoOf();
      if (video?.paused) {
        video.play().catch(() => undefined);
      }
    };
    const onPause = () => {
      const video = videoOf();
      if (!video) {
        return;
      }
      video.pause();
      // Unless this pause is the player seeking (a seek event follows), the
      // timeline moves to where the video stopped.
      clearTimeout(alignTimer);
      alignTimer = setTimeout(() => {
        if (
          player &&
          !player.isPlaying() &&
          frameOf(video) !== player.getCurrentFrame()
        ) {
          aligned = frameOf(video);
          player.seekTo(aligned);
        }
      }, ALIGN_AFTER_PAUSE_MS);
    };
    // The video ends before the lagging timeline does: stop the player there
    // (onPause then moves the timeline to the end) rather than run on silently.
    const onEnded = () => {
      if (player?.isPlaying()) {
        player.pause();
      }
    };
    let watched: HTMLVideoElement | null = null;
    const watch = () => {
      const video = videoOf() ?? null;
      if (video !== watched) {
        watched?.removeEventListener("ended", onEnded);
        video?.addEventListener("ended", onEnded);
        watched = video;
      }
    };
    // A seek by the user, or the editor stepping over a cut, moves the video.
    const onSeeked = ({ detail }: { detail: { frame: number } }) => {
      if (detail.frame === aligned) {
        aligned = null;
        return;
      }
      clearTimeout(alignTimer);
      const video = videoOf();
      if (video) {
        video.currentTime = (detail.frame + trimBefore) / FPS;
      }
    };
    const onVolume = () => {
      const video = videoOf();
      if (video && player) {
        video.muted = player.isMuted();
        video.volume = player.getVolume();
        video.playbackRate = rate;
      }
    };
    const onRate = ({ detail }: { detail: { playbackRate: number } }) => {
      rate = detail.playbackRate;
      onVolume();
    };
    const listen = (next: PlayerRef | null) => {
      player?.removeEventListener("play", onPlay);
      player?.removeEventListener("pause", onPause);
      player?.removeEventListener("seeked", onSeeked);
      player?.removeEventListener("mutechange", onVolume);
      player?.removeEventListener("volumechange", onVolume);
      player?.removeEventListener("ratechange", onRate);
      next?.addEventListener("play", onPlay);
      next?.addEventListener("pause", onPause);
      next?.addEventListener("seeked", onSeeked);
      next?.addEventListener("mutechange", onVolume);
      next?.addEventListener("volumechange", onVolume);
      next?.addEventListener("ratechange", onRate);
      player = next;
      onVolume();
    };
    // The player mounts after a run's live view, so it is looked up again.
    const timer = setInterval(() => {
      if (ref.current !== player) {
        listen(ref.current);
      }
      watch();
    }, 250);
    listen(ref.current);
    return () => {
      clearInterval(timer);
      clearTimeout(alignTimer);
      videoOf()?.pause();
      watched?.removeEventListener("ended", onEnded);
      listen(null);
    };
  }, [ref, url]);
}

/** The preview's video, while it plays; null when it is paused or not there. */
function playingVideo(player: PlayerRef | null): HTMLVideoElement | null {
  const video = player?.getContainerNode()?.querySelector<HTMLVideoElement>("video[data-preview-clock]");
  return video && !video.paused ? video : null;
}

/**
 * Reports the frame being heard while the video plays, every animation frame.
 * The editor's playhead and timeline follow this; the player's own frame lags
 * the video on a slow Mac, and the playhead drifted off the voice it was on.
 */
function useVideoFrame(
  ref: React.RefObject<PlayerRef | null>,
  url: string | null,
  onFrameChange?: (frame: number) => void
) {
  useEffect(() => {
    if (!(url && onFrameChange)) {
      return;
    }
    const trimBefore = trimBeforeFor(url);
    let raf = 0;
    let last = -1;
    const tick = () => {
      const video = playingVideo(ref.current);
      if (video) {
        const frame = Math.max(0, Math.round(video.currentTime * FPS) - trimBefore);
        if (frame !== last) {
          last = frame;
          onFrameChange(frame);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ref, url, onFrameChange]);
}

export function RemotionPlayer({
  onDurationInFrames,
  onFrameChange,
  onMuteChange,
  onPlaybackChange,
  onVolumeChange,
  ref,
}: {
  onDurationInFrames?: (frames: number) => void;
  onFrameChange?: (frame: number) => void;
  onMuteChange?: (isMuted: boolean) => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
  onVolumeChange?: (volume: number) => void;
  ref: React.RefObject<PlayerRef | null>;
}) {
  const { backgroundConfig, generatedVideoUrl, imageOverlays, zoomTrack } =
    useBackgroundStore();
  // While a run records, the page it is working on, from castfy0's live frame.
  const live = useLive();
  // Castfy's own recording browser, from the moment the run opens it.
  const recordingBrowser = useRecordingBrowser();
  const [durationInFrames, setDurationInFrames] = useState(1); // 1 frame @ 30fps = 00:00

  useEffect(() => {
    let cancelled = false;

    // A project exists before its recording does. Probing an empty src throws
    // a MediaError, so there is nothing to measure until the agent has run.
    if (!generatedVideoUrl) {
      setDurationInFrames(1);
      onDurationInFrames?.(1);
      return;
    }

    Promise.resolve(
      calculateMetadata({
        props: { url: generatedVideoUrl ?? "" },
        defaultProps: { url: generatedVideoUrl ?? "" },
        abortSignal: new AbortController().signal,
        compositionId: "StudioComposition",
        isRendering: false,
      })
    )
      .then((meta) => {
        if (!cancelled) {
          const duration = meta?.durationInFrames ?? 1;
          setDurationInFrames(duration);
          onDurationInFrames?.(duration);
        }
      })
      .catch((err) => {
        console.error("Failed to calculate video metadata", err);
        // consider surfacing an error state to the user here
      });

    return () => {
      cancelled = true;
    };
    // generatedVideoUrl belongs here. Without it this measured once, on mount,
    // when the url was still null — leaving durationInFrames at 1 forever, so
    // every seek clamped to frame 0 and playback could not advance. The cloud
    // app got away with it because its url was a module constant; here it
    // arrives asynchronously from the main process.
  }, [onDurationInFrames, generatedVideoUrl]);

  useVideoClock(ref, generatedVideoUrl);
  useVideoFrame(ref, generatedVideoUrl, onFrameChange);

  useEffect(() => {
    const player = ref.current;
    if (!player) {
      return;
    }

    const handleFrameChange = ({ detail }: { detail: { frame: number } }) => {
      // While the video plays, its own time is reported instead (useVideoFrame):
      // the player's frame runs behind it on a slow Mac.
      if (playingVideo(player)) {
        return;
      }
      onFrameChange?.(detail.frame);
    };
    const handlePlay = () => onPlaybackChange?.(true);
    const handlePause = () => onPlaybackChange?.(false);
    const handleMuteChange = ({ detail }: { detail: { isMuted: boolean } }) => {
      onMuteChange?.(detail.isMuted);
    };
    const handleVolumeChange = ({ detail }: { detail: { volume: number } }) => {
      onVolumeChange?.(detail.volume);
    };

    onFrameChange?.(player.getCurrentFrame());
    onMuteChange?.(player.isMuted());
    onPlaybackChange?.(player.isPlaying());
    onVolumeChange?.(player.getVolume());
    player.addEventListener("frameupdate", handleFrameChange);
    player.addEventListener("seeked", handleFrameChange);
    player.addEventListener("play", handlePlay);
    player.addEventListener("pause", handlePause);
    player.addEventListener("mutechange", handleMuteChange);
    player.addEventListener("volumechange", handleVolumeChange);

    return () => {
      player.removeEventListener("frameupdate", handleFrameChange);
      player.removeEventListener("seeked", handleFrameChange);
      player.removeEventListener("play", handlePlay);
      player.removeEventListener("pause", handlePause);
      player.removeEventListener("mutechange", handleMuteChange);
      player.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [onFrameChange, onMuteChange, onPlaybackChange, onVolumeChange, ref]);

  // A run in progress shows live, even over a project's earlier video: the
  // user is re-recording, and needs to see (and maybe sign in on) the page.
  if (live.sessionId || recordingBrowser) {
    return <LiveView sessionId={live.sessionId} />;
  }

  if (!generatedVideoUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
        <p className="font-semibold text-xs">Nothing recorded yet</p>
        <p className="max-w-60 text-balance text-muted-foreground text-xs">
          Use the agent panel to record this demo. It will play here when the
          run finishes.
        </p>
      </div>
    );
  }

  return (
    <Player
      acknowledgeRemotionLicense
      clickToPlay
      component={StudioComposition}
      compositionHeight={1080}
      compositionWidth={1920}
      controls
      doubleClickToFullscreen
      durationInFrames={durationInFrames}
      fps={30}
      inputProps={{
        url: generatedVideoUrl ?? "",
        backgroundConfig,
        imageOverlays,
        zoom: zoomTrack,
      }}
      ref={ref}
      showPlaybackRateControl
      showVolumeControls
      spaceKeyToPlayOrPause={true}
      style={{ width: "100%" }}
    />
  );
}
