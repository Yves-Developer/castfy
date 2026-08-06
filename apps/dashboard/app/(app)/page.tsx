import { HomeHeader } from "@/features/app/home/header";
import { HomeLayout } from "@/features/app/home/layout";
import { HomeList } from "@/features/app/home/list";

export default function Home() {
  return (
    <HomeLayout>
      <div className="flex w-full flex-col gap-10">
        <HomeHeader />
        <HomeList />
      </div>
    </HomeLayout>
  );
}
