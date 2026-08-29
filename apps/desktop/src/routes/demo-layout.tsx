import { Outlet } from 'react-router';
import DemoHeader from '@/features/app/demo/header';
import DemoSidebar from '@/features/app/demo/sidebar';

/** Mirrors the dashboard's (app)/(demo)/demo/[slug]/layout. */
export default function DemoLayout() {
  return (
    <div className="flex h-screen flex-col">
      <DemoHeader />
      <div>
        <DemoSidebar />
        <main className="absolute top-12.75 right-0 bottom-0 left-65">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
