import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import type { TFeature } from "./features";

export default function FeatureCard({ feature }: { feature: TFeature }) {
  return (
    <Card
      className="4xl:h-120 h-96 4xl:w-[36rem] w-80 max-w-full gap-0 bg-background py-0"
      key={feature.title}
    >
      <div className="relative flex 4xl:h-60 h-48 shrink-0 items-center justify-center">
        <feature.icon className="4xl:size-12" size={32} />
      </div>
      <CardHeader className="flex 4xl:h-20 h-14 items-center justify-center px-6 py-0">
        <CardTitle className="w-full text-center 4xl:text-4xl text-xl leading-tight">
          {feature.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-start justify-center 4xl:px-14 px-6 4xl:pt-4 pt-2 pb-8">
        <CardDescription className="w-full text-center 4xl:text-2xl leading-normal opacity-80">
          {feature.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
