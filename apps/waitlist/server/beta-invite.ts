import type { Resend } from "resend";

/**
 * The automatic beta invite: asks the backend for a code for a new waitlist
 * sign-up (packages/backend/convex/waitlist.ts, POST /waitlist/invite), and
 * emails it. Best effort, like the Discord post: the person is on the list
 * either way, and the team can send a code by hand when this did not.
 *
 * Needs CONVEX_SITE_URL (the backend's .convex.site address) and
 * WAITLIST_INVITE_SECRET (the same value as in the Convex dashboard). Without
 * them nothing is asked and nothing is sent.
 */

const INVITE_TIMEOUT_MS = 5000;
const TRAILING_SLASH = /\/$/;
const FROM =
  process.env.BETA_EMAIL_FROM ?? "Yves from Castfy <hello@updates.castfy.app>";
const REPLY_TO = "castfy.app@gmail.com";
const DOWNLOAD_URL =
  "https://castfy.app/?utm_source=waitlist&utm_medium=email&utm_campaign=beta_invite";
const DISCORD_URL = "https://discord.gg/PY8RGrex3V";

/** What happened, for the team's Discord post. */
export type InviteOutcome =
  | { status: "sent"; code: string }
  | { status: "not_sent"; code: string }
  | { status: "already_invited" | "off" | "blocked" | "capped" | "failed" };

async function askForCode(email: string) {
  const site = process.env.CONVEX_SITE_URL?.replace(TRAILING_SLASH, "");
  const secret = process.env.WAITLIST_INVITE_SECRET;
  if (!(site && secret)) {
    return null;
  }
  const response = await fetch(`${site}/waitlist/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ email }),
    signal: AbortSignal.timeout(INVITE_TIMEOUT_MS),
  });
  if (!response.ok) {
    console.log("Beta invite request failed:", response.status);
    return null;
  }
  return (await response.json()) as { status: string; code?: string };
}

export async function sendBetaInvite(
  resend: Resend,
  email: string
): Promise<InviteOutcome | null> {
  let answer: Awaited<ReturnType<typeof askForCode>>;
  try {
    answer = await askForCode(email);
  } catch (error) {
    console.log("Beta invite request failed:", error);
    return { status: "failed" };
  }
  if (!answer) {
    return process.env.CONVEX_SITE_URL ? { status: "failed" } : null;
  }
  if (answer.status !== "invited" || !answer.code) {
    const known = ["already_invited", "off", "blocked", "capped"] as const;
    const status = known.find((s) => s === answer.status) ?? "failed";
    return { status };
  }

  const code = answer.code;
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: "Your Castfy beta code",
    html: inviteHtml(code),
    text: inviteText(code),
  });
  // The code on the Resend contact too (the beta_code property), so it shows
  // there and later broadcasts can use it. Best effort.
  const saved = await resend.contacts
    .update({ email, properties: { beta_code: code } })
    .catch((failure: unknown) => ({ error: failure }));
  if (saved.error) {
    console.log("Could not save beta_code on the contact:", saved.error);
  }
  if (error) {
    console.log("Beta invite email failed:", error);
    return { status: "not_sent", code };
  }
  return { status: "sent", code };
}

function inviteText(code: string) {
  return [
    "Hi,",
    "",
    "Thanks for joining the Castfy waitlist! You're in.",
    "",
    `Your beta code: ${code}`,
    "",
    `1. Download Castfy: ${DOWNLOAD_URL}`,
    "2. Open it, sign in, and enter your code on the plans step (or Settings → Billing).",
    "3. Paste a URL, say what to show, and let your agent record it.",
    "",
    "Your code gives you unlimited demos with no watermark during the beta.",
    "",
    "When something breaks, tell me: your OS, which agent you used, and whether it was the agent (wrong click) or the edit (cut, zoom or narration). Reply to this email or post in Discord:",
    DISCORD_URL,
    "",
    "Thanks for testing,",
    "Yves",
    "",
    "You're receiving this because you joined the Castfy waitlist at castfy.app. Reply to stop these emails.",
    "Castfy · castfy.app · castfy.app@gmail.com",
  ].join("\n");
}

function button(href: string, label: string, color: string) {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px">${label}</a>`;
}

function inviteHtml(code: string) {
  const p = "margin:0 0 16px;font-size:15px;line-height:24px;color:#0b0d12";
  return `<!doctype html>
<html><body style="margin:0;background:#ffffff">
<div style="display:none;max-height:0;overflow:hidden">You're in. Here's your code for unlimited demos during the beta.</div>
<div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<p style="${p}">Hi,</p>
<p style="${p}">Thanks for joining the Castfy waitlist! You're in.</p>
<p style="${p}">Your beta code: <strong style="font-size:18px;letter-spacing:0.5px">${code}</strong></p>
<p style="margin:0 0 24px">${button(DOWNLOAD_URL, "Download Castfy", "#0099FF")}</p>
<p style="${p}">Open it, sign in, and enter your code on the plans step (or Settings → Billing). Then paste a URL, say what to show, and let your agent record it.</p>
<p style="${p}">Your code gives you unlimited demos with no watermark during the beta.</p>
<p style="${p}">When something breaks, tell me: your OS, which agent you used, and whether it was the agent (wrong click) or the edit (cut, zoom or narration). Reply to this email or post in Discord:</p>
<p style="margin:0 0 24px">${button(DISCORD_URL, "Join the Discord", "#5865F2")}</p>
<p style="${p}">Thanks for testing,<br>Yves</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px">
<p style="margin:0 0 6px;font-size:12px;line-height:18px;color:#6b7280">You're receiving this because you joined the Castfy waitlist at castfy.app. Reply to stop these emails.</p>
<p style="margin:0;font-size:12px;line-height:18px;color:#6b7280">Castfy · castfy.app · castfy.app@gmail.com</p>
</div></body></html>`;
}
