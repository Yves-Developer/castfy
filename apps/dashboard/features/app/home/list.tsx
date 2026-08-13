import { demos } from "@/config/data";
import { DemoCard } from "./demo/card";

export function HomeList() {
  return (
    <div className="grid grid-cols-3 gap-10">
      {demos.map((demo) => (
        <DemoCard demo={demo} key={demo.name} />
      ))}
    </div>
  );
}
