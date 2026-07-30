import { demos } from "@/config/data";
import { DemoCard } from "./demo/card";

export function ProjectsList() {
  return (
    <>
      {demos.map((demo) => (
        <DemoCard demo={demo} key={demo.name} />
      ))}
    </>
  );
}
