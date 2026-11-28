# Plan: the Castfy blog

**Status:** not started.

**Why:** Google is already Castfy's biggest source of visitors (14 of ~30 a
week, unpromoted). A blog grows that without an audience, and each post is a
week of things to share.

**Rule:** every post shows a real Castfy demo and ends with a way to try
Castfy. No post makes a claim about another tool that we have not checked and
dated.

## 1. How it is built (apps/web)

Next 16's own MDX guide (`node_modules/next/dist/docs/01-app/02-guides/mdx.md`):
`@next/mdx` with posts as files, loaded by slug.

- **Packages:** `@next/mdx @mdx-js/loader @mdx-js/react @types/mdx`; wrap
  `next.config.ts` with `createMDX`; `pageExtensions` gains `mdx`.
- **Posts:** `apps/web/content/blog/<slug>.mdx`, the text only.
- **Registry:** `config/blog.ts`, like `config/changelog.ts`: one entry per
  post with slug, title, description (the meta description), date, updated
  date, author, tags, reading time, cover image, and `demo` (a gallery slug).
  The registry drives the index, the sitemap, RSS and metadata, so a post
  cannot be published half-described.
- **Pages:**
  - `app/(v1)/blog/page.tsx`: the index, newest first, in the changelog's
    style (GrainPanel header, cards with cover, title, description, date);
  - `app/(v1)/blog/[slug]/page.tsx`: `import(\`@/content/blog/${slug}.mdx\`)`,
    `generateStaticParams` from the registry, `dynamicParams = false`;
    `generateMetadata` (title, description, canonical, Open Graph image);
    JSON-LD `BlogPosting`.
  - `app/(v1)/blog/rss.xml`, like the changelog's.
- **`mdx-components.tsx`** (required by `@next/mdx` with the App Router): the
  site's typography for headings, lists, code and links, plus:
  - `<Demo slug="excalidraw-diagram" />`: the gallery player, with a link to
    its demo page;
  - `<Prompt>…</Prompt>`: the copy box from the demo pages;
  - `<Steps>` / `<Step>`: numbered steps with an optional screenshot;
  - `<TryCastfy />`: the download button and the free-demo offer;
  - `<Note>`: an aside.
- **Wiring:** blog in the sitemap (from the registry), in the nav's Product
  menu and the footer, and "Related posts" (2, by tag) under each post.
- **Analytics:** pageviews already flow to PostHog; add `blog_cta_clicked`
  with the post's slug, and a Blog row on the journey dashboard
  (blog visitor → download → first demo → purchase).
- **Check:** light and dark, phone width, the RSS validates, Lighthouse SEO.

## 2. Each post

- **Title** = the phrase people search ("How to make a product demo video").
- **First two sentences** answer it (what search snippets show).
- **A real demo** near the top (`<Demo>`).
- **Steps** with screenshots from the real app; **the exact prompt** in
  `<Prompt>`.
- **The free-demo offer** midway: "Send us your URL, we'll make your demo."
- **`<TryCastfy />`** at the end, and links to 2 older posts and `/demos`.
- 800–1,500 words; a cover image (1200×630) for sharing.

## 3. The first ten posts

| # | Title | Search it is for | Proof inside |
|---|---|---|---|
| 1 | How to make a product demo video in 5 minutes | product demo video | Excalidraw demo |
| 2 | I gave Claude Code a URL and it recorded a product demo | claude code demo video | Agent view thread, turns, cost |
| 3 | How to make a demo video for your Product Hunt launch | product hunt demo video | OrbitOS demo |
| 4 | How to record a demo of an app behind a login | record demo web app login | Linear demo (when made) |
| 5 | Make demo videos with OpenCode and any model | opencode, ai demo video | OpenCode run |
| 6 | Record a demo of your app on localhost, before you deploy | record localhost demo | A localhost run |
| 7 | What it costs when your AI agent records a demo | claude code cost per task | Haiku vs Sonnet vs Opus runs |
| 8 | 5 product demos, each from one sentence | showcase | The gallery |
| 9 | Castfy vs. screen recorders | screen studio alternative | Side by side |
| 10 | The best ways to make a SaaS demo video in 2026 | saas demo video | Honest list |

Posts 4–7 wait on the demos or runs they show; write them as those land.

## 4. Rhythm

- One post a week, published Monday.
- The same post goes out four ways that week: an X thread (Tue), a LinkedIn
  post with the video uploaded (Wed), one or two Reddit answers where the exact
  question is asked (Thu), a reel from its demo (Fri).
- Free demos for makers continue daily; each is sent with the matching post.

## 5. Measure (every Friday)

Blog visitors and how many from Google; downloads from blog visitors; first
demos; free-demo conversations; sales. A post with no Google traffic after six
weeks gets its title changed to a real search; clicks without downloads mean
the post's ending, not its content, needs work.

## 6. Order of work

1. Build the blog (section 1) with post 1 published and post 2 drafted.
2. Add the Blog row to the PostHog dashboard.
3. Then one post a week from the table, as in section 4.
