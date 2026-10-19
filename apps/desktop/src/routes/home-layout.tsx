import { Outlet } from 'react-router';
import { NewDemo } from '@/features/app/home/new/demo';
import { NewFolder } from '@/features/app/home/new/folder';
import HomeSidebar from '@/features/app/home/sibebar';

/**
 * Mirrors the dashboard's (app)/(home)/layout. `props.children` becomes an
 * Outlet; everything else is the dashboard's markup unchanged, so a change
 * there can still be brought across by eye.
 */
export default function HomeLayout() {
  return (
    <div className="h-screen">
      <HomeSidebar className="fixed inset-y-0 left-0 w-65" />
      {/* Scrolls by itself: the window's body never scrolls (styles.css), so
          the studio cannot, and a list taller than the window was cut off. */}
      <div className="ml-65 flex h-screen flex-col overflow-y-auto">
        <main className="flex w-full min-w-0 flex-1 overflow-x-auto px-12.5 py-15">
          <Outlet />
        </main>
      </div>
      <NewDemo />
      <NewFolder />
    </div>
  );
}
