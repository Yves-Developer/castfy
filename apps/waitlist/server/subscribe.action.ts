"use server";

import { Resend } from "resend";
import { type InviteOutcome, sendBetaInvite } from "./beta-invite";
import type { TWaitlistFormSchema } from "./schema";

const resend = new Resend(process.env.RESEND_API_KEY);
const segmentId = process.env.RESEND_SEGMENT_ID;

/** A Discord channel webhook; unset, sign-ups are not announced anywhere. */
const discordWebhookUrl = process.env.DISCORD_WAITLIST_WEBHOOK_URL;

/** Gives up on Discord after this long, so a slow webhook never holds up the form. */
const DISCORD_TIMEOUT_MS = 3000;

/** The embed's left-hand strip: green, for someone new. */
const EMBED_COLOR = 0x22_c5_5e;

/** Mail providers anyone can sign up with: the domain says nothing about them. */
const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
]);

/**
 * The Discord embed for a sign-up: a card with a colored strip, the address,
 * and the company it likely comes from when it is a work address.
 */
/** The beta code line of the Discord post: what the automatic invite did. */
const INVITE_LABELS: Record<InviteOutcome["status"], string> = {
  sent: "Sent",
  not_sent: "Made, but the email failed: send it by hand",
  already_invited: "Already has one",
  off: "Automatic codes are off: send one by hand",
  blocked: "Not sent: throwaway address",
  capped: "Not sent: today's limit reached, send one by hand",
  failed: "Not sent: the backend did not answer, send one by hand",
};

function signupEmbed(email: string, invite: InviteOutcome | null) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const work = domain !== "" && !PERSONAL_DOMAINS.has(domain);
  const fields = [
    { name: "Email", value: email, inline: true },
    {
      name: "Type",
      value: work ? `Work (${domain})` : "Personal",
      inline: true,
    },
  ];
  if (invite) {
    const code = "code" in invite ? ` (${invite.code})` : "";
    fields.push({
      name: "Beta code",
      value: `${INVITE_LABELS[invite.status]}${code}`,
      inline: false,
    });
  }
  return {
    title: "New waitlist sign-up",
    color: EMBED_COLOR,
    fields,
    footer: { text: "waitlist.castfy.app" },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Posts the sign-up to the team's Discord channel. Best effort: a failure is
 * logged and otherwise ignored, because the person is already on the list.
 */
async function announceSignup(email: string, invite: InviteOutcome | null) {
  if (!discordWebhookUrl) {
    return;
  }
  try {
    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Castfy Waitlist",
        embeds: [signupEmbed(email, invite)],
        // An address must never ping anyone.
        allowed_mentions: { parse: [] },
      }),
      signal: AbortSignal.timeout(DISCORD_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.log("Discord waitlist webhook failed:", response.status);
    }
  } catch (error) {
    console.log("Discord waitlist webhook failed:", error);
  }
}

export async function subscribe(formData: TWaitlistFormSchema) {
  try {
    const { email } = formData;
    if (!segmentId) {
      return { success: false, error: "Missing configuration" };
    }

    await resend.contacts.create({ email });

    const response = await resend.contacts.segments.add({
      email,
      segmentId,
    });

    if (response.error) {
      console.log(response.error);
      return { success: false, error: response.error };
    }

    const invite = await sendBetaInvite(resend, email);
    await announceSignup(email, invite);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
