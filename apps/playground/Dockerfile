# Playground demo-recording service.
#
# Build from the REPO ROOT (the pnpm workspace needs the root manifests):
#
#   DOCKER_BUILDKIT=1 docker build \
#     -f apps/playground/Dockerfile \
#     --secret id=npm_token,env=NODE_AUTH_TOKEN \
#     -t castfy-playground .
#
# The base image is Microsoft's Playwright image pinned to the same version the
# lockfile resolves (1.60.0). It ships Chromium plus every system library the
# browser needs, already matched to that release — installing browsers ourselves
# risks a version skew against whatever @yves-developer/castfy0-mcp drives.
# It is Ubuntu-based on purpose: the MCP renders via `ffmpeg-static`, whose
# prebuilt binary is glibc-linked and will not run on Alpine.
FROM mcr.microsoft.com/playwright:v1.60.0-noble AS base

ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    CI=true
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

# ---------------------------------------------------------------------------
# Dependencies. Copied separately from source so edits don't bust this layer.
# ---------------------------------------------------------------------------
FROM base AS deps

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY apps/playground/package.json ./apps/playground/

# @yves-developer/castfy0-mcp lives on GitHub Packages. The token is mounted as
# a BuildKit secret so it never lands in an image layer or the build history.
RUN --mount=type=secret,id=npm_token,required=true \
    NODE_AUTH_TOKEN="$(cat /run/secrets/npm_token)" \
    pnpm install --frozen-lockfile --filter @workspace/playground...

# ---------------------------------------------------------------------------
# Runtime.
# ---------------------------------------------------------------------------
FROM base AS runner

ENV NODE_ENV=production \
    PORT=3001

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/playground/node_modules ./apps/playground/node_modules
COPY --from=deps /app/packages ./packages
COPY pnpm-workspace.yaml package.json ./
COPY apps/playground ./apps/playground

WORKDIR /app/apps/playground

# Scratch space for renders before they are uploaded. Mount a volume here, or
# accept that artifacts die with the container until Phase 2 moves them to
# object storage.
RUN mkdir -p output && chown -R pwuser:pwuser /app/apps/playground

# The Playwright image ships this unprivileged user; browsers should never run
# as root.
USER pwuser

EXPOSE 3001

# SIGTERM must reach Node directly for the graceful drain in src/index.ts to
# run, so exec form with no shell wrapper.
CMD ["pnpm", "start"]
