import { NewDemo } from "@/features/app/home/new/demo";
import { NewFolder } from "@/features/app/home/new/folder";
import HomeSidebar from "@/features/app/home/sibebar";

export default function HomeLayout(props: LayoutProps<"/">) {
  return (
    <div className="min-h-screen">
      <HomeSidebar className="fixed inset-y-0 left-0 w-65" />
      <div className="ml-65 flex min-h-screen flex-col">
        <main className="flex w-full min-w-0 flex-1 overflow-x-auto px-12.5 py-15">
          {props.children}
        </main>
      </div>
      <NewDemo />
      <NewFolder />
    </div>
  );
}
