/**
 * Records a desktop download in PostHog, from the server, so ad blockers do
 * not hide it. Anonymous: the platform, the file and release, the page the
 * button was on, its utm_ campaign tags, and the country. No person profile
 * is made. Without a PostHog token (local development) nothing is sent.
 */

const TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const TRAILING_SLASH = /\/$/;

/**
 * Where events go. NEXT_PUBLIC_POSTHOG_HOST when it is a full address;
 * POSTHOG_CAPTURE_HOST overrides it (e.g. when the browser one is a proxy
 * path); otherwise PostHog's US cloud.
 */
function captureHost() {
  const host =
    process.env.POSTHOG_CAPTURE_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST;
  return host?.startsWith("http")
    ? host.replace(TRAILING_SLASH, "")
    : "https://us.i.posthog.com";
}

/** Crawlers, link previews and command-line fetches are not downloads. */
const NOT_A_PERSON =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|curl|wget|python-requests|headless/i;

/** Gives up on PostHog after this long; the visitor has their file already. */
const TIMEOUT_MS = 3000;

/** The visitor's PostHog id from the site's cookie, so the download joins their visit. */
function distinctId(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  const name = `ph_${TOKEN}_posthog=`;
  const raw = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(name));
  if (raw) {
    try {
      const value = JSON.parse(decodeURIComponent(raw.slice(name.length)));
      if (typeof value.distinct_id === "string") {
        return value.distinct_id as string;
      }
    } catch {
      // A cookie that does not parse is treated as no cookie.
    }
  }
  return crypto.randomUUID();
}

/** The page the button was on, and its campaign tags, from the Referer. */
function origin(request: Request) {
  const referrer = request.headers.get("referer");
  const out: Record<string, string> = {};
  if (!referrer) {
    return out;
  }
  try {
    const url = new URL(referrer);
    out.page = url.pathname;
    out.referrer_host = url.host;
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
    ]) {
      const value = url.searchParams.get(key);
      if (value) {
        out[key] = value;
      }
    }
  } catch {
    // Not a URL: leave it out.
  }
  return out;
}

export async function recordDownload(
  request: Request,
  download: { platform: string; file?: string; release?: string }
) {
  if (!TOKEN || request.method !== "GET") {
    return;
  }
  const agent = request.headers.get("user-agent") ?? "";
  if (agent === "" || NOT_A_PERSON.test(agent)) {
    return;
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const tags = origin(request);
  try {
    await fetch(`${captureHost()}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TOKEN,
        event: "download",
        distinct_id: distinctId(request),
        timestamp: new Date().toISOString(),
        properties: {
          ...download,
          ...tags,
          // Campaign tags under PostHog's own names too, for its built-in breakdowns.
          ...(tags.utm_source ? { $utm_source: tags.utm_source } : {}),
          source: tags.utm_source ?? "site",
          country: request.headers.get("x-vercel-ip-country") ?? undefined,
          $ip: ip,
          $raw_user_agent: agent,
          $process_person_profile: false,
          $lib: "castfy-web-server",
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Could not record the download in PostHog:", error);
  }
}
