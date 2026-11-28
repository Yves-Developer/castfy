import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentProps } from "react";
import { Demo, Note, Prompt, Shot, Step, Steps } from "@/features/blog/parts";
import { FreeDemo, TryCastfy } from "@/features/blog/try-castfy";

/**
 * How blog posts (content/blog/*.mdx) look: the site's type for plain
 * markdown, and the post building blocks, usable in any post without an
 * import. Required by @next/mdx with the App Router.
 */
const components: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-12 mb-4 scroll-mt-24 text-balance font-[450] text-[26px] leading-8 tracking-[-0.02em]"
      {...props}
    />
  ),
  h3: (props) => <h3 className="mt-8 mb-3 font-medium text-xl" {...props} />,
  p: (props) => <p className="my-5 text-[17px] leading-8" {...props} />,
  ul: (props) => (
    <ul
      className="my-5 list-disc pl-6 text-[17px] leading-8 marker:text-muted-foreground"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="my-5 list-decimal pl-6 text-[17px] leading-8 marker:text-muted-foreground"
      {...props}
    />
  ),
  li: (props) => <li className="my-1.5 pl-1" {...props} />,
  strong: (props) => <strong className="font-semibold" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-6 border-brand border-l-2 pl-5 text-muted-foreground italic"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.88em]"
      {...props}
    />
  ),
  hr: () => <hr className="my-12" />,
  table: (props) => (
    <div className="my-8 overflow-x-auto rounded-xl border">
      <table
        className="w-full border-collapse text-[15px] leading-6"
        {...props}
      />
    </div>
  ),
  thead: (props) => <thead className="bg-secondary/60 text-left" {...props} />,
  th: (props) => <th className="border-b px-4 py-3 font-medium" {...props} />,
  td: (props) => (
    <td
      className="border-b px-4 py-3 align-top [tr:last-child>&]:border-b-0"
      {...props}
    />
  ),
  a: ({ href = "", ...props }: ComponentProps<"a">) =>
    href.startsWith("/") ? (
      <Link
        className="text-brand underline underline-offset-4 hover:no-underline"
        href={href as never}
        {...props}
      />
    ) : (
      <a
        className="text-brand underline underline-offset-4 hover:no-underline"
        href={href}
        rel="noopener"
        target="_blank"
        {...props}
      />
    ),
  Demo,
  FreeDemo,
  Note,
  Prompt,
  Shot,
  Step,
  Steps,
  TryCastfy,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
