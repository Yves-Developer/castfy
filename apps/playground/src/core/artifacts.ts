/**
 * Maps the MCP's deliverables onto playable URLs. Extracted from index.ts so
 * the worker can build the same map without depending on the HTTP layer.
 *
 * These still point at the local `output/` mount. Phase 2 replaces the base URL
 * with object storage, at which point this is the only place that changes.
 */

export function resolveVideoFile(
  files: Record<string, unknown> | undefined | null
): string {
  if (!files) {
    return "demo.webm";
  }
  if (files.videoWithAudioClean) {
    return "demo-with-audio-clean.mp4";
  }
  if (files.videoWithAudio) {
    return "demo-with-audio.mp4";
  }
  if (files.videoClean) {
    return "demo-clean.webm";
  }
  return "demo.webm";
}

export function buildVideosMap(
  files: Record<string, unknown> | undefined | null,
  baseUrl: string
): Record<string, string> {
  const videos: Record<string, string> = {};
  if (!files) {
    return videos;
  }
  if (files.video) {
    videos.raw = `${baseUrl}/demo.webm`;
  }
  if (files.videoClean) {
    videos.clean = `${baseUrl}/demo-clean.webm`;
  }
  if (files.videoWithAudio) {
    videos.audio = `${baseUrl}/demo-with-audio.mp4`;
  }
  if (files.videoWithAudioClean) {
    videos.audioClean = `${baseUrl}/demo-with-audio-clean.mp4`;
  }
  return videos;
}

export function extractDeliverableFiles(
  deliverables: unknown
): Record<string, unknown> | undefined {
  return (
    deliverables as
      | { deliverables?: { files?: Record<string, unknown> } }
      | null
      | undefined
  )?.deliverables?.files;
}
