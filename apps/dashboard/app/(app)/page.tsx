import { ProjectsHeader } from "@/features/app/home/header";
import ProjectsLayout from "@/features/app/home/layout";
import { ProjectsList } from "@/features/app/home/list";

export default function Home() {
  return (
    <ProjectsLayout>
      <div className="mx-auto grid min-w-165 max-w-390 grid-cols-[repeat(auto-fill,260px)] flex-col justify-center gap-10 px-12.5 pt-7.5 pb-15">
        <ProjectsHeader />
        <ProjectsList />
      </div>
    </ProjectsLayout>
  );
}
