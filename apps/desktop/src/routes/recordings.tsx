import { RecordingsList } from '@/features/app/recordings/list';

export default function RecordingsPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Recordings</h1>
        <p className="text-muted-foreground text-sm">
          Every recording on this machine. Updates live — a run continues even if
          you leave this page.
        </p>
      </div>
      <RecordingsList />
    </div>
  );
}
