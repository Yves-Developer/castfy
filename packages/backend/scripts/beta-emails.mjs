#!/usr/bin/env node
/**
 * Emails the beta testers through Resend. From packages/backend:
 *
 *   node scripts/beta-emails.mjs welcome waitlist.csv           # preview
 *   node scripts/beta-emails.mjs welcome waitlist.csv --send
 *
 *   node scripts/beta-emails.mjs invite waitlist.csv --download <url>
 *   node scripts/beta-emails.mjs invite waitlist.csv --download <url> --send
 *
 * welcome  "The beta opens on <date>": the same email to everyone.
 * invite   "You're in": each person gets their own beta code, made on the
 *          production deployment with `convex run billing:createBetaCodes`
 *          (the address is the code's note, so you can see who has which).
 *
 * The list is any file with email addresses in it, such as Resend's contacts
 * export; everything else in it is ignored. Without --send nothing is sent and
 * no codes are made: it prints who would get what.
 *
 * Re-running is safe. Who got which email (and which code) is kept in
 * .beta-emails/<template>.json; anyone in it is skipped. A code is written
 * there before its email goes out, so a failed send keeps the same code
 * for the next try.
 *
 * Needs RESEND_API_KEY. From address: BETA_EMAIL_FROM, or
 * "Yves from Castfy <hello@updates.castfy.app>" (the domain must be verified
 * in Resend). Replies go to castfy.app@gmail.com.
 * Options: --date "November 10" (welcome), --deployment <name> instead of
 * --prod for the codes, --only <email> to send to one address (try it on
 * yourself first).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const LEDGER_DIR = path.join(BACKEND_DIR, ".beta-emails");

const FROM =
  process.env.BETA_EMAIL_FROM ?? "Yves from Castfy <hello@updates.castfy.app>";
const REPLY_TO = "castfy.app@gmail.com";
const DISCORD = "https://discord.gg/PY8RGrex3V";
const DEFAULT_DATE = "November 10";

/** Resend allows 2 requests a second by default. */
const SEND_GAP_MS = 600;

const BETA_CODE = /BETA-[A-Z0-9]+/;

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function parseArgs(argv) {
  const [template, listFile, ...rest] = argv;
  const options = {
    send: false,
    date: DEFAULT_DATE,
    download: null,
    deployment: null,
    only: null,
  };
  const queue = [...rest];
  while (queue.length > 0) {
    const arg = queue.shift();
    if (arg === "--send") {
      options.send = true;
    } else if (arg === "--date") {
      options.date = queue.shift();
    } else if (arg === "--download") {
      options.download = queue.shift();
    } else if (arg === "--deployment") {
      options.deployment = queue.shift();
    } else if (arg === "--only") {
      options.only = queue.shift()?.toLowerCase();
    } else {
      fail(`Unknown option: ${arg}`);
    }
  }
  return { template, listFile, options };
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readEmails(file) {
  const text = fs.readFileSync(file, "utf8");
  return [...new Set((text.match(EMAIL) ?? []).map((e) => e.toLowerCase()))];
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Paragraphs of plain text, as HTML that reads well in any mail client. */
function toHtml(paragraphs) {
  const body = paragraphs
    .map((p) => {
      const html = escapeHtml(p)
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
        .replace(/\n/g, "<br>");
      return `<p style="margin:0 0 16px">${html}</p>`;
    })
    .join("\n");
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:560px">\n${body}\n</div>`;
}

const TEMPLATES = {
  welcome: ({ date }) => {
    const paragraphs = [
      "Hi,",
      "Thanks for joining the Castfy waitlist. Castfy turns a URL and one sentence into a polished product demo video: your coding agent clicks through the site, and Castfy records it, zooms in on what matters and narrates it.",
      `The private beta opens on ${date}, and you're one of the first people in. On that day you'll get a download link (Mac and Windows) and your own beta code, which makes Castfy free and unlimited for you during the beta.`,
      "To be ready, install Claude Code (https://claude.com/claude-code). Codex and Cursor work too, but they are still experimental.",
      `Come say hi on Discord, where the other testers are and where we fix what breaks: ${DISCORD}`,
      "Talk soon,\nYves, Castfy",
    ];
    return {
      subject: `Castfy beta opens ${date}: you're on the list`,
      text: paragraphs.join("\n\n"),
      html: toHtml(paragraphs),
    };
  },

  invite: ({ code, download }) => {
    const paragraphs = [
      "Hi,",
      "The Castfy beta is open, and you're in.",
      `Your beta code: ${code}\nIt's yours alone, and makes Castfy free and unlimited for you during the beta.`,
      `Get started:\n1. Download Castfy: ${download}\n2. Open it and sign in with Google.\n3. When it asks for a plan, enter your beta code.\n4. Connect Claude Code, then give Castfy a URL and one sentence about what to show.`,
      `Something broke or felt off? Use Report a problem in the app's menu and drop the file it saves into #bugs on Discord: ${DISCORD}`,
      'Every bit of feedback helps, even "this was confusing". Just reply to this email.',
      "Thanks for trying it early,\nYves, Castfy",
    ];
    return {
      subject: "Your Castfy beta code is here",
      text: paragraphs.join("\n\n"),
      html: toHtml(paragraphs),
    };
  },
};

function loadLedger(template) {
  const file = path.join(LEDGER_DIR, `${template}.json`);
  try {
    return { file, entries: JSON.parse(fs.readFileSync(file, "utf8")) };
  } catch {
    return { file, entries: {} };
  }
}

function saveLedger(ledger) {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });
  const temp = `${ledger.file}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(ledger.entries, null, 2)}\n`);
  fs.renameSync(temp, ledger.file);
}

/** One new beta code, made on the deployment, noted with the tester's address. */
function createCode(email, deployment) {
  const target = deployment ? ["--deployment", deployment] : ["--prod"];
  const out = execFileSync(
    "npx",
    [
      "convex",
      "run",
      "billing:createBetaCodes",
      JSON.stringify({ count: 1, note: email }),
      ...target,
    ],
    { cwd: BACKEND_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }
  );
  const code = out.match(BETA_CODE)?.[0];
  if (!code) {
    fail(`No code in the output of createBetaCodes:\n${out}`);
  }
  return code;
}

async function sendEmail(template, to, email) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      // Resend drops a repeat of the same key, so a retried run cannot
      // send the same email twice.
      "Idempotency-Key": `castfy-beta-${template}-${to}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject: email.subject,
      text: email.text,
      html: email.html,
      tags: [{ name: "campaign", value: `beta_${template}` }],
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `${response.status} ${body.message ?? JSON.stringify(body)}`
    );
  }
  return body.id;
}

async function main() {
  const { template, listFile, options } = parseArgs(process.argv.slice(2));
  if (!(template in TEMPLATES && listFile)) {
    fail(
      "Usage: node scripts/beta-emails.mjs <welcome|invite> <list-file> [--send] [--download <url>] [--date <date>] [--only <email>] [--deployment <name>]"
    );
  }
  if (template === "invite" && !options.download) {
    fail("invite needs --download <url>: where testers get the app.");
  }
  if (options.send && !process.env.RESEND_API_KEY) {
    fail("Set RESEND_API_KEY to send.");
  }

  let emails = readEmails(listFile);
  if (options.only) {
    emails = emails.filter((e) => e === options.only);
  }
  if (emails.length === 0) {
    fail(
      `No email addresses found in ${listFile}${options.only ? ` matching ${options.only}` : ""}.`
    );
  }

  const ledger = loadLedger(template);
  const pending = emails.filter((e) => !ledger.entries[e]?.sentAt);
  const skipped = emails.length - pending.length;
  console.log(
    `${template}: ${emails.length} addresses, ${skipped} already sent, ${pending.length} to go.`
  );
  console.log(`From: ${FROM}\n`);

  if (options.send) {
    await sendAll(template, pending, ledger, options);
  } else {
    preview(template, pending, options);
  }
}

/** What would go out, without sending anything or making codes. */
function preview(template, pending, options) {
  const sample = TEMPLATES[template]({
    date: options.date,
    download: options.download,
    code: "BETA-XXXXXX",
  });
  console.log(`Subject: ${sample.subject}\n\n${sample.text}\n`);
  console.log(
    `Would send to:\n${pending.map((e) => `  ${e}`).join("\n") || "  (nobody)"}`
  );
  console.log(
    "\nPreview only. Add --send to send (and, for invite, make the codes)."
  );
}

/** Sends to everyone pending, logging each send to the ledger as it goes. */
async function sendAll(template, pending, ledger, options) {
  let sent = 0;
  for (const to of pending) {
    const entry = ledger.entries[to] ?? {};
    if (template === "invite" && !entry.code) {
      entry.code = createCode(to, options.deployment);
      ledger.entries[to] = entry;
      saveLedger(ledger);
    }
    const email = TEMPLATES[template]({
      date: options.date,
      download: options.download,
      code: entry.code,
    });
    try {
      entry.id = await sendEmail(template, to, email);
      entry.sentAt = new Date().toISOString();
      ledger.entries[to] = entry;
      saveLedger(ledger);
      sent++;
      console.log(`sent  ${to}${entry.code ? `  ${entry.code}` : ""}`);
    } catch (error) {
      console.log(`FAIL  ${to}: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, SEND_GAP_MS));
  }
  console.log(
    `\n${sent} of ${pending.length} sent. Log: ${path.relative(process.cwd(), ledger.file)}`
  );
}

await main();
