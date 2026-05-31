import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import { CardDescription, CardTitle } from "@workspace/ui/components/card";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem } from "@/components/carousel";
import { usaCases } from "@/config/data";
import type { TUseCase } from "@/types";
export function UsaeCase() {
  return (
    <section className="flex flex-col gap-10">
      <div className="space-y-2">
        <p className="font-semibold text-muted-foreground text-sm tracking-wide">
          USE CASES
        </p>
        <p className="font-medium text-3xl md:text-4xl">
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
          <CardTitle className="font-medium text-xl lg:text-2xl">
            {project.title}
          </CardTitle>
          <CardDescription>
            <span className="capitalize">{project.type}</span> .{" "}
            {project.description}
          </CardDescription>
        </div>
      </div>
    </Link>
  );
}
