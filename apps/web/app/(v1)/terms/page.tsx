import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalEmail,
  LegalPage,
  LegalSection,
} from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Castfy, its website and your account.",
};

export default function TermsPage() {
  return (
    <LegalPage
      intro={
        <p>
          These terms cover the Castfy desktop app, this website and your Castfy
          account. By using them you agree to these terms. Questions:{" "}
          <LegalEmail />.
        </p>
      }
      title="Terms of Service"
    >
      <LegalSection title="What Castfy is">
        <p>
          Castfy records product demos on your computer: it drives a browser
          with the coding agent you connect, then cuts, narrates and exports the
          video. It needs a supported agent, installed and signed in under your
          own account with its provider.
        </p>
      </LegalSection>

      <LegalSection title="The beta">
        <p>
          Castfy is in a private beta. It is still changing, may have bugs, and
          features may be added, changed or removed. Beta codes are personal:
          one per person, not to be shared or sold. A code gives unlimited demos
          until the beta ends; after that, your account moves to the free plan
          unless you buy Castfy.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          You sign in with Google and are responsible for what happens under
          your account. Tell us at <LegalEmail /> if you think someone else is
          using it.
        </p>
      </LegalSection>

      <LegalSection title="What you record">
        <p>
          Your recordings are yours; Castfy claims no rights to them. Only
          record websites and apps you are allowed to use and show. You are
          responsible for what you record and share, and for following the terms
          of the sites you record and of your agent's provider.
        </p>
      </LegalSection>

      <LegalSection title="Plans and payment">
        <ul>
          <li>
            <strong>Free:</strong> five demos per account, with every feature.
            Their videos carry a small Castfy watermark. A demo counts when it
            is recorded, in the Castfy app or by an agent outside it, and once
            only, however often you export it.
          </li>
          <li>
            <strong>Castfy:</strong> a one-time purchase for unlimited demos
            without the watermark, including a year of updates. The version you
            have when that year ends keeps working.
          </li>
        </ul>
        <p>
          Purchases are sold and processed by Dodo Payments, our merchant of
          record, which also handles taxes and receipts. Prices can change for
          new purchases, never for one you have made. Refunds are covered by our{" "}
          <Link href="/refund">Refund Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Your licence">
        <p>
          You may install and use Castfy on your own computers, for personal or
          commercial demos. You may not resell or redistribute the app, copy it
          to offer as a service, or reverse engineer it except where the law
          allows.
        </p>
      </LegalSection>

      <LegalSection title="Fair use">
        <p>
          Do not use Castfy to break the law, to access systems you are not
          allowed to, to record or publish other people's private data without
          permission, or to get around the free limit or beta codes. We may
          suspend accounts that do.
        </p>
      </LegalSection>

      <LegalSection title="Other services">
        <p>
          Castfy works with services we do not run, such as your coding agent,
          Google and payment providers. Their own terms apply to your use of
          them, and we are not responsible for them.
        </p>
      </LegalSection>

      <LegalSection title="No warranty, and limits">
        <p>
          Castfy is provided as is. We work to make it reliable, but cannot
          promise it is free of errors or right for every purpose. As far as the
          law allows, we are not liable for indirect or consequential losses,
          and our total liability is limited to what you paid us in the twelve
          months before the claim. Nothing here limits rights you have by law as
          a consumer.
        </p>
      </LegalSection>

      <LegalSection title="Ending your account">
        <p>
          You can stop using Castfy and ask us to delete your account at any
          time. We may suspend or close accounts that break these terms.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms as Castfy changes. When the change is
          significant we tell account holders by email; using Castfy after it
          takes effect means you accept it.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
