import { blogOgCard, OG_SIZE } from "@/features/blog/og-card";

/** The blog page's share card (features/blog/og-card.tsx). */
export const alt = "The Castfy blog: how to make product demos people watch";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return blogOgCard({
    kicker: "castfy.app/blog",
    title: "How to make product demos people watch",
  });
}
