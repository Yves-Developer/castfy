import type { Metadata } from "next";
import {
  LegalEmail,
  LegalPage,
  LegalSection,
} from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Castfy collects, why, and who it is shared with.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      intro={
        <p>
          Castfy is a desktop app that records product demos on your own
          computer. This policy explains what stays on your machine, what Castfy
          collects to run your account, and which services help it do that.
          Questions: <LegalEmail />.
        </p>
      }
      title="Privacy Policy"
    >
      <LegalSection title="What stays on your computer">
        <p>
          Your recordings, projects, exported videos and the browser Castfy
          drives all live on your computer. Castfy does not upload them, and we
          never see the pages you record, what you type into them, or the
          sessions you are signed in with.
        </p>
        <p>
          <strong>Report a problem</strong> saves a file with your latest
          recording and logs to your Downloads folder. Nothing is sent: it only
          leaves your computer if you share it yourself, for example on our
          Discord.
        </p>
      </LegalSection>

      <LegalSection title="What Castfy collects">
        <ul>
          <li>
            <strong>Your account:</strong> when you sign in with Google, your
            name, email address, profile picture and Google account ID.
          </li>
          <li>
            <strong>Sign-in sessions:</strong> the sessions on your devices,
            with the IP address and browser or app details they started from, so
            you can see and end them in Settings.
          </li>
          <li>
            <strong>Your plan and usage:</strong> your plan, any beta code you
            redeemed, and a record of each demo you export (an ID and the time),
            which is how the free limit is counted. Not the video or what is in
            it.
          </li>
          <li>
            <strong>Purchases:</strong> if you buy Castfy, the payment and
            customer IDs, the email used and the payment status. Card details go
            to our payment provider, never to us.
          </li>
          <li>
            <strong>How the app is used:</strong> the desktop app sends a few
            usage events, such as the app opening or updating, signing in and
            out, a demo starting, finishing or failing (with how long it took),
            and an export finishing. Each comes with the app version, your
            operating system and an ID for your install, and is linked to your
            account once you sign in. It never includes what is on screen, the
            URLs you record, what you ask the agent, your recordings, file names
            or error messages. You can turn it off in the app (see Your
            choices).
          </li>
          <li>
            <strong>On the website:</strong> the email you give to join the
            waitlist, what you send through the contact form, and analytics
            about how the site is used (pages viewed, browser and device type).
          </li>
        </ul>
        <p>
          We use this to run your account, apply your plan, take payments,
          answer you, and improve Castfy. We do not sell it, and we do not use
          it for advertising.
        </p>
      </LegalSection>

      <LegalSection title="Services that process data for Castfy">
        <ul>
          <li>
            <strong>Google</strong>, to sign you in.
          </li>
          <li>
            <strong>Convex</strong>, which hosts Castfy's backend and stores the
            account data above.
          </li>
          <li>
            <strong>Vercel</strong>, which hosts this website.
          </li>
          <li>
            <strong>Dodo Payments</strong>, which sells Castfy as the merchant
            of record and handles payments, taxes and refunds.
          </li>
          <li>
            <strong>Resend</strong>, which keeps the waitlist and sends our
            emails.
          </li>
          <li>
            <strong>PostHog</strong>, for website and app usage analytics.
          </li>
          <li>
            <strong>Microsoft's speech service</strong>: when a demo has a
            voiceover, its script is sent there to be turned into audio.
          </li>
        </ul>
        <p>
          Recordings are driven by the coding agent you connect (such as Claude
          Code, Codex or the Cursor CLI). It runs under your own account with
          that provider, which receives your instructions and the pages it reads
          under its own terms and privacy policy, not ours.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          Account data is kept while you have an account. When you ask us to
          delete your account, we delete it, except purchase records we must
          keep for tax and accounting. Waitlist emails are kept until you
          unsubscribe or ask us to remove them.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <ul>
          <li>
            Email <LegalEmail /> to get a copy of your data, correct it, or
            delete your account.
          </li>
          <li>Sign out or end a session at any time in the app's Settings.</li>
          <li>
            Turn off <strong>Share usage data</strong> in the app's Settings,
            under Profile, and the app stops sending usage events.
          </li>
          <li>Our newsletters and announcements have an unsubscribe link.</li>
          <li>
            Uninstalling Castfy removes the app. Your recordings stay in their
            folder until you delete them.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Castfy is not meant for anyone under 16, and we do not knowingly
          collect their data.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          If this policy changes, we update this page and its date, and tell
          account holders by email when the change is significant.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
