import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/**
 * Posts to the team's private Discord channel when someone signs in to the
 * desktop app (billing.issueRecorderKey), so a new tester is seen the moment
 * they get in. Off when DISCORD_SIGNIN_WEBHOOK_URL is not set in the Convex
 * dashboard; a failed post only logs, it never affects the sign-in.
 */

/** Gives up on Discord after this long. */
const DISCORD_TIMEOUT_MS = 4000;

/** The embed's left-hand strip: blue for a first sign-in, grey for a return. */
const NEW_COLOR = 0x00_99_ff;
const RETURN_COLOR = 0x6b_72_80;

export const appSignIn = internalAction({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    plan: v.string(),
    firstTime: v.boolean(),
    devices: v.number(),
  },
  handler: async (_ctx, args) => {
    const url = process.env.DISCORD_SIGNIN_WEBHOOK_URL;
    if (!url) {
      return null;
    }
    const fields = [
      { name: "Email", value: args.email, inline: true },
      { name: "Plan", value: args.plan, inline: true },
      { name: "Devices", value: String(args.devices), inline: true },
    ];
    if (args.name) {
      fields.unshift({ name: "Name", value: args.name, inline: true });
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Castfy App",
          embeds: [
            {
              title: args.firstTime
                ? "New sign-in to the app"
                : "Signed in again",
              color: args.firstTime ? NEW_COLOR : RETURN_COLOR,
              fields,
              timestamp: new Date().toISOString(),
            },
          ],
          // A name or address must never ping anyone.
          allowed_mentions: { parse: [] },
        }),
        signal: AbortSignal.timeout(DISCORD_TIMEOUT_MS),
      });
      if (!response.ok) {
        console.log("Discord sign-in webhook failed:", response.status);
      }
    } catch (error) {
      console.log("Discord sign-in webhook failed:", error);
    }
    return null;
  },
});
