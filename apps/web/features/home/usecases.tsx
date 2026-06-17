"use client";

import { AspectRatio } from "@castfy/ui/components/aspect-ratio";
import { CardDescription, CardTitle } from "@castfy/ui/components/card";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/carousel";
import { usaCases } from "@/config/data";
import type { TUseCase } from "@/types";

export function UseCases() {
  return (
    <section
      className="container border-y py-12 sm:py-16 lg:py-24"
      id="use-cases"
    >
      <div className="mb-10 space-y-4 text-center sm:mb-12">
        <h2 className="font-serif text-2xl text-foreground sm:text-2xl">
          Use Cases
        </h2>
        <p className="mx-auto hidden max-w-2xl px-4 font-sans text-base text-muted-foreground leading-normal sm:block">
          Your url is turned into demo in minutes.
        </p>
      </div>

      <Carousel>
        <div className="relative mb-4 flex items-center justify-end gap-6">
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
    if (!videoRef.current) {
      return;
    }

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
          autoPlay={false}
          className="aspect-video h-full w-full object-cover"
          loop
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          playsInline
          ref={videoRef}
          src={project.media}
        >
          <track kind="captions" src={project.media} />
        </video>

        <button
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="absolute top-2 right-2 flex items-center justify-center"
          onClick={togglePlay}
          type="button"
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
