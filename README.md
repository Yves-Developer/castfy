# Castfy

**Turn a URL into a narrated product demo.** Paste a URL and say what to show. Your coding agent (Claude Code, or the Codex and Cursor CLIs) clicks through your app in a real browser on your own machine. Castfy then cuts the waiting, zooms on every click, adds narration, and exports an MP4.

- **Runs on your machine:** localhost, staging and apps behind a login all work, and nothing is uploaded.
- **Uses the agent you already pay for:** no API key, no extra AI bill.
- **An editor for the last mile:** trim, blur anything private, change the background, export.
- **An MCP server too:** ask Claude Code for a demo right where you work.

[castfy.app](https://castfy.app) · [Download](https://castfy.app) · [Discord](https://discord.gg/PY8RGrex3V) · [Releases](https://github.com/Yves-Developer/castfy/releases)

## Download

| Platform | File |
|---|---|
| macOS, Apple silicon | [castfy.app/download/mac](https://castfy.app/download/mac) (`.dmg`) |
| macOS, Intel | [castfy.app/download/mac-intel](https://castfy.app/download/mac-intel) (`.dmg`) |
| Windows x64 | [castfy.app/download/windows](https://castfy.app/download/windows) (`.exe`) |
| Linux x64 | [castfy.app/download/linux](https://castfy.app/download/linux) (`.AppImage`) |

On Linux, make the file executable first: `chmod +x Castfy-*.AppImage && ./Castfy-*.AppImage`.

The app updates itself. The Mac builds are signed and notarized. The Windows build is not signed yet: if Windows warns you, click **More info**, then **Run anyway**.

## Pricing

Castfy is in **private beta**: testers get a free beta code for unlimited demos. [Join the waitlist](https://waitlist.castfy.app) to get one.

Outside the beta, Castfy is **one payment: $29 for the first 20 buyers, then $49**. There is no subscription and no free tier.

## What's in this repository

A pnpm and Turborepo monorepo.

| Path | What it is |
|---|---|
| `apps/desktop` | The Castfy desktop app (Electron, with a React and Vite UI). Records, edits and exports demos; exports render with Remotion. |
| `apps/web` | [castfy.app](https://castfy.app) (Next.js): the site, downloads, the update feed for the app, and the legal pages. |
| `apps/waitlist` | [waitlist.castfy.app](https://waitlist.castfy.app) (Next.js): sign-ups go to Resend and Discord, and new testers get a beta code by email. |
| `packages/backend` | The backend (Convex): accounts (Better Auth with Google), plans and beta codes, Dodo Payments checkout and webhooks, and the recording checks. |
| `packages/plans` | The plans and prices, shared by the app, the site and the backend. |
| `packages/ui` | Shared UI components (shadcn/ui). |
| `apps/dashboard`, `apps/playground` | Earlier prototypes, not part of the product. |

The recording engine, **castfy0** (an MCP server that drives the browser and assembles the video), lives in a separate private repository. The desktop app bundles it at release time.

## Development

Requires Node 20 or later and pnpm 9.

```bash
pnpm install
```

**Website and waitlist**

```bash
pnpm --filter web dev        # http://localhost:3003
pnpm --filter waitlist dev   # http://localhost:3004
```

**Backend**

```bash
cd packages/backend
npx convex dev
```

Merging to `main` deploys the backend to production (`.github/workflows/convex-deploy.yml`).

**Desktop app**

The app needs a built castfy0 next to this repository (`../castfy0`), or `CASTFY0_MCP_ENTRY` pointing at its `dist/index.js`.

```bash
cd apps/desktop
pnpm dev:renderer   # the UI, in one terminal
pnpm start          # the app, in another
```

To package it locally for the machine you're on: `pnpm dist:mac`, `pnpm dist:win` or `pnpm dist:linux`.

**Code style**

Formatting and linting are done by Biome through Ultracite: `pnpm dlx ultracite check` and `pnpm dlx ultracite fix`. See `AGENTS.md`.

## Releasing the desktop app

1. Push a branch named `release/desktop-v<version>`, for example `release/desktop-v0.1.0-beta.27`, with `apps/desktop/package.json` set to that version.
2. `.github/workflows/desktop-release.yml` builds Windows, macOS (Apple silicon and Intel) and Linux on their own runners, signs and notarizes the Mac builds, and creates a **draft** GitHub release with the installers and update files.
3. Publish the draft. The site's download links and the apps' auto-updater (through `castfy.app/updates`) only see published releases.

## Feedback

Found a bug or have an idea? Use **Report a problem** in the app, post in [Discord](https://discord.gg/PY8RGrex3V), or write to castfy.app@gmail.com.
