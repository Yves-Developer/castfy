"use server";

import { Resend } from "resend";
import type { TWaitlistFormSchema } from "./schema";

const resend = new Resend(process.env.RESEND_API_KEY);
const segmentId = process.env.RESEND_SEGMENT_ID;

/** A Discord channel webhook; unset, sign-ups are not announced anywhere. */
const discordWebhookUrl = process.env.DISCORD_WAITLIST_WEBHOOK_URL;

/** Gives up on Discord after this long, so a slow webhook never holds up the form. */
const DISCORD_TIMEOUT_MS = 3000;

/**
 * Posts the sign-up to the team's Discord channel. Best effort: a failure is
 * logged and otherwise ignored, because the person is already on the list.
 */
async function announceSignup(email: string) {
  if (!discordWebhookUrl) {
    return;
  }
  try {
    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `New waitlist sign-up: ${email}`,
        // Only the text above; an address must never ping anyone.
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

    await announceSignup(email);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
