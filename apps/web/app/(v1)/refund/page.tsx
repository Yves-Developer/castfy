import type { Metadata } from "next";
import {
  LegalEmail,
  LegalPage,
  LegalSection,
} from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "How refunds work for Castfy.",
};

/** How long after a purchase a refund is given without questions. */
const REFUND_DAYS = 14;

export default function RefundPage() {
  return (
    <LegalPage
      intro={
        <p>
          Castfy has a free plan so you can try it first. If you buy it and it
          is not right for you, here is how to get your money back.
        </p>
      }
      title="Refund Policy"
    >
      <LegalSection title={`${REFUND_DAYS}-day refund`}>
        <p>
          Within {REFUND_DAYS} days of buying Castfy, you can ask for a full
          refund, for any reason. Email <LegalEmail /> from the address you
          bought with, or reply to your receipt, and say you would like a
          refund.
        </p>
      </LegalSection>

      <LegalSection title="How it is paid">
        <p>
          Castfy is sold through Dodo Payments, our merchant of record, which
          returns the money to the card or account you paid with. Banks usually
          show it within 5 to 10 business days.
        </p>
        <p>
          Once refunded, your account goes back to the free plan. Your
          recordings and projects stay on your computer.
        </p>
      </LegalSection>

      <LegalSection title="After the refund window">
        <p>
          After {REFUND_DAYS} days, purchases are not normally refunded. If
          something went wrong, such as a double charge or Castfy not working on
          your computer, write to us anyway: we look at every case.
        </p>
      </LegalSection>

      <LegalSection title="Beta codes">
        <p>Beta codes are free, so there is nothing to refund.</p>
      </LegalSection>
    </LegalPage>
  );
}
