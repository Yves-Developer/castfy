import VideoPlayerPro from "@/components/custom/video-player";

export default function DemoVideoPlayer() {
  return (
    <div className="flex min-h-105 w-full items-center justify-center px-4">
      <VideoPlayerPro src="https://placeholdervideo.dev/1920x1080" />
    </div>
  );
}
