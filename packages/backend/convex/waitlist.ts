import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { insertBetaCode } from "./billing";

/**
 * Automatic beta codes for people who join the waitlist. The waitlist site
 * (apps/waitlist) asks through POST /waitlist/invite (http.ts) right after a
 * sign-up is saved, and emails the code it gets back.
 *
 * Settings, in the Convex dashboard:
 *   AUTO_BETA_INVITES     "on" to send codes; anything else pauses them
 *   WAITLIST_DAILY_CAP    at most this many automatic codes in 24 hours (20)
 *   WAITLIST_INVITE_SECRET  the shared secret the waitlist site sends
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DAILY_CAP = 20;

/** Throwaway inbox services: a code sent there reaches no real tester. */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "sharklasers.com",
  "10minutemail.com",
  "10minutemail.net",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.dev",
  "tempmailo.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "mailnesia.com",
  "throwawaymail.com",
  "fakeinbox.com",
  "mohmal.com",
  "emailondeck.com",
]);

function dailyCap(): number {
  const value = Number(process.env.WAITLIST_DAILY_CAP);
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_DAILY_CAP;
}

/**
 * A beta code for this address, unless it already has one, automatic invites
 * are off, the address is a throwaway one, or today's cap is reached. Says
 * which, so the waitlist site can tell the team on Discord.
 */
export const invite = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("waitlistInvites")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      return { status: "already_invited" as const };
    }
    if (process.env.AUTO_BETA_INVITES !== "on") {
      return { status: "off" as const };
    }
    const domain = email.split("@")[1] ?? "";
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return { status: "blocked" as const };
    }
    const cap = dailyCap();
    const recent = await ctx.db
      .query("waitlistInvites")
      .withIndex("by_created", (q) => q.gte("createdAt", Date.now() - DAY_MS))
      .take(cap + 1);
    // Rows marked by hand (no code) are not automatic invites.
    if (recent.filter((row) => row.code !== "").length >= cap) {
      return { status: "capped" as const };
    }
    const code = await insertBetaCode(ctx, { note: `waitlist: ${email}` });
    await ctx.db.insert("waitlistInvites", {
      email,
      code,
      createdAt: Date.now(),
    });
    return { status: "invited" as const, code };
  },
});

/**
 * Marks addresses that already got a code by hand, so the automatic invites
 * never send them a second one. From the Convex dashboard (Functions →
 * waitlist:markInvited) with {"emails": ["a@example.com", ...]}.
 */
export const markInvited = internalMutation({
  args: { emails: v.array(v.string()) },
  handler: async (ctx, args) => {
    let added = 0;
    for (const raw of args.emails) {
      const email = raw.trim().toLowerCase();
      if (!email) {
        continue;
      }
      const existing = await ctx.db
        .query("waitlistInvites")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
      if (!existing) {
        await ctx.db.insert("waitlistInvites", {
          email,
          code: "",
          createdAt: 0,
        });
        added += 1;
      }
    }
    return { added };
  },
});
