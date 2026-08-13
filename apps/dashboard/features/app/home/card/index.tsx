import { AspectRatio } from "@castfy/ui/components/aspect-ratio";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@castfy/ui/components/context-menu";
import Image from "next/image";
import Link from "next/link";
import type { Tdemo } from "@/types";
import { DemoActions, DemoContextMenuActions } from "./actions";

export function DemoCard({ demo }: { demo: Tdemo }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="group relative flex flex-col gap-2">
          <Link className="absolute inset-0 z-1" href={`/demo/${demo.slug}`} />
          <AspectRatio
            className="relative overflow-hidden rounded-lg bg-muted"
            ratio={16 / 9}
          >
            {demo.img ? (
              <Image
                alt={demo.name}
                className="size-full object-cover transition-all duration-300 group-hover:scale-105"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={demo.img}
              />
            ) : (
              <div className="block size-full rounded-lg bg-muted transition-all duration-300 group-hover:scale-105" />
            )}
          </AspectRatio>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5 font-medium text-[13px]">
              <p>{demo.name}</p>
              <p className="text-muted-foreground">
                {demo.action} {demo.updatedAt}
              </p>
            </div>
            <DemoActions />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        <DemoContextMenuActions />
      </ContextMenuContent>
    </ContextMenu>
  );
}
