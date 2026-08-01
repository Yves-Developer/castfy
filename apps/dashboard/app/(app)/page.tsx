import { HomeHeader } from "@/features/app/home/header";
import { HomeLayout } from "@/features/app/home/layout";
import { HomeList } from "@/features/app/home/list";

export default function Home() {
  return (
    <HomeLayout>
      <div className="mx-auto grid min-w-165 max-w-390 grid-cols-[repeat(auto-fill,260px)] flex-col justify-center gap-10 px-12.5 pt-7.5 pb-15">
        <HomeHeader />
        <HomeList />
      </div>
    </HomeLayout>
  );
}
