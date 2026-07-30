export default function AppTimelines() {
  return (
    <div className="flex flex-col gap-2 p-2.5">
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
