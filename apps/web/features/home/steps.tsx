/**
 * PLACEHOLDER FOOTAGE — swap before launch.
 *
 * All three clips are real Castfy output, but they are the only recordings that
 * do not show the pre-rebuild castfy.app (old $32/mo pricing, old FAQ copy).
 * 02 and 03 are the same session: the raw capture, then the composited export.
 */
const processes = [
  {
    title: "Paste a URL and say what to show",
    desc: "Two fields. No script, no storyboard, no take.",
    video: "/steps/01-prompt.mp4",
  },
  {
    title: "Your agent runs it",
    desc: "Castfy hands the job to Claude Code, Codex or Cursor, headless. A real browser opens on your machine and works through the flow.",
    video: "/steps/02-agent.mp4",
  },
  {
    title: "Edit and export",
    desc: "The dead time is already cut and the narration is written. Pick a background, set the ratio, export to your disk.",
    video: "/steps/03-export.mp4",
  },
];

export function HomeSteps() {
  return (
    <section className="container flex flex-col gap-10" id="journey">
      <h2 className="text-h2">How it works</h2>

      <div className="divide-y border-y">
        {processes.map((p, i) => (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2" key={p.title}>
            <div className="flex items-start gap-10 py-6 md:gap-20">
              <div className="flex items-center gap-1 font-light font-mono text-foreground/85 text-xs uppercase">
                <p>Step</p>
                <div className="size-1 rounded-full bg-foreground/85" />
                <p>0{i + 1}</p>
              </div>
              <div className="flex max-w-sm flex-col gap-4">
                <p className="text-xl tracking-tight lg:text-2xl">{p.title}</p>
                <p className="text-muted-foreground text-sm leading-6 tracking-tight lg:text-lg">
                  {p.desc}
                </p>
              </div>
            </div>
            <div className="relative aspect-video w-full">
              <video
                autoPlay
                className="size-full rounded-lg object-cover"
                controls={false}
                loop
                muted
                playsInline
              >
                <source src={p.video} type="video/mp4" />
              </video>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
