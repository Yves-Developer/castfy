import { HomeLayout } from "@/features/app/home/layout";

export default function ArchivedDemos() {
  return (
    <HomeLayout>
      <div className="mx-auto flex min-h-full max-w-40 flex-1 flex-col items-center justify-center gap-2.5 text-center text-xs">
        <p className="font-semibold">No Archived Demos</p>
        <p className="text-balance font-medium text-muted-foreground">
          All archived demos will be listed here.
        </p>
      </div>
    </HomeLayout>
  );
}
