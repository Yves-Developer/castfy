"use client";

import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import { CardDescription, CardTitle } from "@workspace/ui/components/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/carousel";
import { usaCases } from "@/config/data";
import type { TUseCase } from "@/types";
import { PlayIcon, PauseIcon } from "lucide-react";
import { useRef, useState } from "react";

export function UseCases() {
  return (
    <section
      className="py-12 container sm:py-16 border-y lg:py-24"
      id="use-cases"
    >
        <div className="text-center space-y-4 mb-10 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-2xl text-foreground">
            Use Cases
          </h2>
          <p className="hidden sm:block font-sans text-base text-muted-foreground leading-normal max-w-2xl mx-auto px-4">
            Your url is turned into demo in minutes.
          </p>
        </div>

        <Carousel>
            <div className="flex items-center relative justify-end gap-6 mb-4">
            <CarouselPrevious />
        <CarouselNext />
      </div>
          <CarouselContent>
            {usaCases.map((project) => (
              <CarouselItem className="basis-1/2" key={project.title}>
                <UseCaseCard project={project} />
              </CarouselItem>
            ))}
          </CarouselContent>
    
        </Carousel>
    </section>
  );
}






export function UseCaseCard({ project }: { project: TUseCase }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <AspectRatio
        className="group relative overflow-hidden rounded-lg bg-muted"
        ratio={16 / 9}
      >
        <video
          ref={videoRef}
          autoPlay={false}
          loop
          playsInline
          className="aspect-video h-full w-full object-cover"
          src={project.media}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <track kind="captions" src={project.media} />
        </video>

        <button
          type="button"
          onClick={togglePlay}
          className="absolute top-2 right-2 flex items-center justify-center"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all group-hover:scale-110">
            {isPlaying ? (
              <PauseIcon className="size-6" />
            ) : (
              <PlayIcon className="ml-1 size-6 fill-current" />
            )}
          </div>
        </button>
      </AspectRatio>

      <div>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>
          <span className="capitalize">{project.type}</span> ·{" "}
          {project.description}
        </CardDescription>
      </div>
    </div>
  );
}