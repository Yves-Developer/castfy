const processes = [
  {
    title: "Enter your URL + Prompt",
    desc: "Paste your product URL + Prompt and let AI analyze your product, messaging, and key features automatically.",
    video: "https://byhuy.b-cdn.net/WebM/Strategy%20Compressed.webm",
  },
  {
    title: "We generate your demo",
    desc: "AI creates a polished product demo in minutes, complete with engaging flows and clear messaging.",
    video: "https://byhuy.b-cdn.net/WebM/Design%20FINAL%20compressed.webm",
  },
  {
    title: "Add your final touch",
    desc: "Customize the content, branding, and experience before exporting your demo in multiple formats.",
    video: "https://byhuy.b-cdn.net/WebM/Development%20Final%20Compressed.webm",
  },
];

export function HomeSteps() {
  return (
    <section className="container flex flex-col gap-10" id="journey">
      <h2 className="text-h2">Demo Journey</h2>

      <div className="divide-y border-y">
        {processes.map((p, i) => (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2" key={i}>
            <div className="flex items-start gap-10 py-6 md:gap-20">
              <div className="flex items-center gap-1 font-light font-mono text-foreground/85 text-xs uppercase">
                <p>Step</p>
                <div className="size-1 rounded-full bg-foreground/85" />
                <p>0{i + 1}</p>
              </div>
              <div>
                <div className="flex max-w-sm flex-col gap-4">
                  <p className="text-xl tracking-tight lg:text-2xl">
                    {p.title}
                  </p>
                  <p className="text-muted-foreground text-sm leading-6 tracking-tight lg:text-lg">
                    {p.desc}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative aspect-video w-full">
              <video autoPlay className="w-full" controls={false} loop muted>
                <source src={p.video} type="video/mp4" />
                <track
                  kind="subtitles"
                  label="English"
                  src="/path/to/captions.vtt"
                  srcLang="en"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
