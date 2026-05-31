import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Image from "next/image";
import step1 from "@/public/step1.webp";

const steps = [
  {
    title: "Enter Url",
    desc: "Quickly share your video with anyone by generating a link.",
    coverImg: step1,
  },
  {
    title: "Get demo",
    desc: "Quickly share your video with anyone by generating a link.",
    coverImg: step1,
  },
  {
    title: "Add final touch",
    desc: "Quickly share your video with anyone by generating a link.",
    coverImg: step1,
  },
];

export function HowItWorks() {
  return (
    <section className="flex flex-col gap-10">
      <div className="space-y-2">
        <p className="font-semibold text-muted-foreground text-sm tracking-wide">
          HOW IT WORKS
        </p>
        <p className="font-medium text-3xl md:text-4xl">
          How a Url Becomes a Demo
        </p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {steps.map((step) => (
          <Card className="overflow-hidden pb-0" key={step.title}>
            <CardHeader>
              <CardTitle className="text-xl">{step.title}</CardTitle>
              <CardDescription>{step.desc}</CardDescription>
            </CardHeader>
            <AspectRatio className="overflow-hidden bg-muted" ratio={16 / 9}>
              <Image
                alt={step.title}
                className="h-full w-full object-cover"
                fill
                src={step.coverImg}
              />
            </AspectRatio>
          </Card>
        ))}
      </div>
    </section>
  );
}
