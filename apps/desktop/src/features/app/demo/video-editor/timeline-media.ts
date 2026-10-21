import { useEffect, useState } from "react";

/** Thumbnail height in device pixels; the video track is about 56px tall. */
const THUMB_HEIGHT = 112;
/** How far into a clip its thumbnail is taken: past the cut, on the action. */
const THUMB_OFFSET_MS = 600;
/** One waveform bar per this much audio. */
const PEAK_MS = 20;

/**
 * A still for each clip, taken from the video itself, so the opening shot and
 * clips without a step screenshot have one too. Seeks a detached <video>
 * through the clips one by one; keyed by the clip's start.
 */
export function useClipThumbnails(
  url: string | null,
  clips: Array<{ startMs: number; endMs: number }>
): Map<number, string> {
  const [thumbs, setThumbs] = useState<Map<number, string>>(new Map());
  const key = clips.map((c) => `${c.startMs}-${c.endMs}`).join(",");

  useEffect(() => {
    if (!(url && clips.length)) {
      setThumbs(new Map());
      return;
    }
    let cancelled = false;
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "auto";
    video.src = url;
    const canvas = document.createElement("canvas");

    const seek = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const done = () => {
          video.removeEventListener("seeked", done);
          video.removeEventListener("error", fail);
          resolve();
        };
        const fail = () => reject(new Error("Could not read the video"));
        video.addEventListener("seeked", done);
        video.addEventListener("error", fail);
        video.currentTime = ms / 1000;
      });

    const run = async () => {
      await new Promise<void>((resolve, reject) => {
        video.addEventListener("loadeddata", () => resolve(), { once: true });
        video.addEventListener("error", () => reject(new Error("Could not load the video")), {
          once: true,
        });
      });
      canvas.height = THUMB_HEIGHT;
      canvas.width = Math.round((THUMB_HEIGHT * video.videoWidth) / Math.max(1, video.videoHeight));
      const context = canvas.getContext("2d");
      const out = new Map<number, string>();
      for (const clip of clips) {
        if (cancelled || !context) {
          return;
        }
        const at = Math.min(clip.startMs + THUMB_OFFSET_MS, (clip.startMs + clip.endMs) / 2);
        await seek(at);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        out.set(clip.startMs, canvas.toDataURL("image/jpeg", 0.7));
        setThumbs(new Map(out));
      }
    };
    run().catch(() => {
      // No thumbnails: the clips show their colour and label instead.
    });
    return () => {
      cancelled = true;
      video.removeAttribute("src");
      video.load();
    };
    // `key` stands for the clips' identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key]);

  return thumbs;
}

/**
 * The loudness of the video's audio, one value (0..1) per PEAK_MS, for the
 * voice track's waveform. Null while loading or when there is no audio.
 */
export function useWaveform(url: string | null): { peaks: Float32Array; peakMs: number } | null {
  const [wave, setWave] = useState<{ peaks: Float32Array; peakMs: number } | null>(null);

  useEffect(() => {
    setWave(null);
    if (!url) {
      return;
    }
    let cancelled = false;
    const run = async () => {
      const data = await (await fetch(url)).arrayBuffer();
      const context = new OfflineAudioContext(1, 1, 44_100);
      const audio = await context.decodeAudioData(data);
      const samples = audio.getChannelData(0);
      const perPeak = Math.max(1, Math.round((audio.sampleRate * PEAK_MS) / 1000));
      const peaks = new Float32Array(Math.ceil(samples.length / perPeak));
      let loudest = 0;
      for (let i = 0; i < peaks.length; i++) {
        let max = 0;
        const end = Math.min(samples.length, (i + 1) * perPeak);
        for (let j = i * perPeak; j < end; j++) {
          const v = Math.abs(samples[j]);
          if (v > max) {
            max = v;
          }
        }
        peaks[i] = max;
        loudest = Math.max(loudest, max);
      }
      if (loudest > 0) {
        for (let i = 0; i < peaks.length; i++) {
          peaks[i] /= loudest;
        }
      }
      if (!cancelled && loudest > 0) {
        setWave({ peaks, peakMs: PEAK_MS });
      }
    };
    run().catch(() => {
      // A silent video, or one the browser cannot decode: no waveform.
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return wave;
}
