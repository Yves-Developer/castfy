import { HomeHeader } from '@/features/app/home/header';
import { HomeList } from '@/features/app/home/list';

export default function Home() {
  return (
    <div className="flex w-full flex-col gap-10">
      <HomeHeader />
      <HomeList />
    </div>
  );
}
