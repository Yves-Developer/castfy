export default function AppTimelines() {
  return (
    <div className="group relative flex flex-col gap-2 p-2.5">
      <div className="absolute inset-0 z-10 hidden items-center justify-center bg-background/40 backdrop-blur-sm group-hover:flex">
        <p className="text-foreground/70 text-sm tracking-tight">
          In Development
        </p>
      </div>
      <div className="h-5 w-full rounded-xl bg-muted" />
      <div className="flex justify-around">
        <div className="h-5 w-1/4 rounded-xl bg-primary/50" />
        <div className="h-5 w-1/3 rounded-xl bg-muted" />
      </div>
      <div className="flex justify-end">
        <div className="h-5 w-1/2 rounded-xl bg-primary/50" />
      </div>
    </div>
  );
}
