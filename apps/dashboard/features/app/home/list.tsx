import { demos } from "@/config/data";
import { DemoCard } from "./card";

export function HomeList() {
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
      {demos.map((demo) => (
        <DemoCard demo={demo} key={demo.name} />
      ))}
    </div>
  );
}
