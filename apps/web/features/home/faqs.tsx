import { faqs } from "@/config/data";

export default function HomeFaqs() {
  return (
    <section className="container" id="faqs">
      <div className="mx-auto flex max-w-lg flex-col gap-15 pt-5">
        <h2 className="text-balance text-center font-medium text-[28px] leading-7.75 tracking-[-0.04em] md:text-4xl md:leading-10 lg:text-[44px] lg:leading-12">
          FAQ
        </h2>
        <div className="flex flex-col gap-10">
          {faqs.map((f) => (
            <div className="flex flex-col gap-2.5" key={f.question}>
              <p className="text-lg">{f.question}</p>
              <p className="text-muted-foreground">{f.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
