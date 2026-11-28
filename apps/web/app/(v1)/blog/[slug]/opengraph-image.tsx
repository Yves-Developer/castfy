import { publishedPosts } from "@/config/blog";
import { blogOgCard, OG_SIZE } from "@/features/blog/og-card";

/** Each post's share card (features/blog/og-card.tsx). */
export const alt = "A post on the Castfy blog";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return publishedPosts.map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = publishedPosts.find((p) => p.slug === slug);
  return blogOgCard({
    kicker: "Castfy blog",
    title: post?.title ?? "The Castfy blog",
  });
}
