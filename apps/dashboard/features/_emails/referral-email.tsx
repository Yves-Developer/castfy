import { Body, Html, Preview, Section, Tailwind, Text } from "react-email";
import type { TReferralFormSchema } from "@/server/schema";

export const ReferralEmail = ({
  interstedIn,
  workEmail,
  firstName,
  lastName,
  phoneNumber,
  description,
  receiveUpdates,
}: TReferralFormSchema) => {
  const name = workEmail.split("@")[0];

  return (
    <Html>
      <Preview>Message from {name}</Preview>
      <Tailwind>
        <Body className="max-w-[600px] font-sans text-black/80">
          {/* Main Content */}
          <Section>
            {interstedIn && <Text>{interstedIn}</Text>}
            <Text>{description}</Text>
            <Text>{firstName}</Text>
            <Text>{lastName}</Text>
            <Text>{phoneNumber}</Text>
          </Section>

          <Section>
            {receiveUpdates && (
              <Text>I would like to receive updates about Rathon.</Text>
            )}
          </Section>

          <Section>
            <Text>{workEmail}</Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
};
