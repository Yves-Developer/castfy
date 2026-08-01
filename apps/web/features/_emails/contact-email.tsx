import { Body, Html, Preview, Section, Tailwind, Text } from "react-email";
import type { TContactFormSchema } from "@/server/schema";

export const ContactEmail = ({
  workEmail,
  companyName,
  role,
  firstName,
  lastName,
  needs,
  receiveUpdates,
}: TContactFormSchema) => {
  const name = workEmail.split("@")[0];

  return (
    <Html>
      <Preview>Message from {name}</Preview>
      <Tailwind>
        <Body className="max-w-150 font-sans text-black/80">
          {/* Main Content */}
          <Section>
            <Text>{needs}</Text>
            <Text>{companyName}</Text>
            <Text>{firstName}</Text>
            <Text>{lastName}</Text>
            <Text>{role}</Text>
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
