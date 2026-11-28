import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPostDate, publishedPosts } from "@/config/blog";
import { siteConfig } from "@/config/site";
import { PageRails } from "@/features/home/patterns";

export function generateStaticParams() {
  return publishedPosts.map((p) => ({ slug: p.slug }));
}

/** Only the posts in config/blog.ts: any other slug is a 404. */
export const dynamicParams = false;

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = publishedPosts.find((p) => p.slug === slug);
  if (!post) {
    return {};
  }
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      // The image itself is opengraph-image.tsx, next to this page.
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = publishedPosts.find((p) => p.slug === slug);
  if (!post) {
    notFound();
  }
  const { default: Post } = await import(`@/content/blog/${slug}.mdx`);
  const related = publishedPosts.filter((p) => p.slug !== slug).slice(0, 2);

  // What search engines read about the post.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: siteConfig.name },
    image: `${siteConfig.url}${post.cover.src.src}`,
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  return (
    <div className="relative flex flex-col">
      <PageRails />
      <article className="page relative mx-auto flex w-full max-w-[720px] flex-col pt-10 pb-16 md:pt-14">
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data the page builds itself
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
        <Link
          className="inline-flex w-fit items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
          href="/blog"
        >
          <ArrowLeftIcon className="size-4" /> All posts
        </Link>
        <header className="mt-8 flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time> ·{" "}
            {post.minutes} min read · {post.author}
          </p>
          <h1 className="text-balance text-h1">{post.title}</h1>
        </header>
        <div className="mt-4">
          <Post />
        </div>
      </article>
      {related.length > 0 ? (
        <section className="page relative mx-auto w-full max-w-[720px] border-t pt-10 pb-24">
          <h2 className="font-medium text-xl">More from the blog</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {related.map((p) => (
              <li key={p.slug}>
                <Link
                  className="group flex flex-col gap-3"
                  href={`/blog/${p.slug}`}
                >
                  <div className="overflow-hidden rounded-xl border bg-secondary">
                    <Image
                      alt={p.cover.alt}
                      className="block aspect-[1200/630] h-auto w-full object-cover"
                      placeholder="blur"
                      sizes="(min-width: 640px) 340px, 100vw"
                      src={p.cover.src}
                    />
                  </div>
                  <h3 className="font-medium leading-6 group-hover:underline group-hover:underline-offset-4">
                    {p.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="pb-16" />
      )}
    </div>
  );
}
