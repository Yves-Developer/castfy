"use client";

import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import { CardDescription, CardTitle } from "@workspace/ui/components/card";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem } from "@/components/carousel";
import { usaCases } from "@/config/data";
import type { TUseCase } from "@/types";

export function UseCases() {
  return (
    <section className="bg-background py-12 sm:py-16 border-y lg:py-24">
      <div className="max-w-350 mx-auto">
        <div className="text-center space-y-4 mb-10 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-2xl text-foreground">
            Use Cases
          </h2>
          <p className="hidden sm:block font-sans text-base text-muted-foreground leading-normal max-w-2xl mx-auto px-4">
            Your url is turned into demo in minutes.
          </p>
        </div>

        <Carousel>
          <CarouselContent>
            {usaCases.map((project) => (
              <CarouselItem className="basis-1/2" key={project.title}>
                <UseCaseCard project={project} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* <CarouselPrevious />
        <CarouselNext /> */}
        </Carousel>
      </div>
    </section>
  );
}

export function UseCaseCard({ project }: { project: TUseCase }) {
  return (
    <Link className="w-full" href={`/work/${project.slug}`}>
      <div className="flex flex-col gap-4">
        <AspectRatio
          className="overflow-hidden rounded-lg bg-muted"
          ratio={16 / 9}
        >
          <video
            autoPlay
            className="aspect-video h-full w-full object-cover"
            loop
            playsInline
            src={project.media}
          >
            <track kind="captions" src={project.media} />
          </video>
        </AspectRatio>

        <div>
          <CardTitle>{project.title}</CardTitle>
          <CardDescription>
            <span className="capitalize">{project.type}</span> .{" "}
            {project.description}
          </CardDescription>
        </div>
      </div>
    </Link>
  );
}
