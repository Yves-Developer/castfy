import {
  Body,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

export const ThankYouForSubscribingTemplate = () => {
  return (
    <Html>
      <Preview>
        Excited to have you with us here&apos;s what&apos;s next
      </Preview>
      <Tailwind>
        <Body className="max-w-[600px] font-sans text-black/80">
          {/* Header */}
          <Section>
            <Text>Hey,</Text>
            <Text>I&apos;m Constantin — Founder and CEO of Rathon.</Text>
          </Section>

          {/* Main Content */}
          <Section>
            <Text>
              We started Rathon to help businesses stand out, scale up, and
              dominate the digital space by making their websites fast, clear,
              SEO-friendly, and trustworthy.
            </Text>
            <Text>
              Through making their website fast, clear, seo-friendly and
              trustworthy.
            </Text>
            <Text>Here are the services that we offer:</Text>
            <ul>
              <li className="py-2">
                <Link href="https://www.rathon-rw.com/services">
                  Website design:
                </Link>{" "}
                Beautiful, user-focused designs that convert.
              </li>
              <li className="pb-2">
                <Link href="https://www.rathon-rw.com/services">
                  Website development:
                </Link>{" "}
                Fast, secure, and mobile-friendly builds.
              </li>
              <li className="pb-2">
                <Link href="https://www.rathon-rw.com/services">
                  Website maintenance:
                </Link>{" "}
                Keep your site running smoothly 24/7.
              </li>
              <li>
                ...and more.{" "}
                <Link href="https://www.rathon-rw.com/services">
                  See all our services
                </Link>
              </li>
            </ul>
            <Text>
              I&apos;d love to know <strong>what made you sign up?</strong> Was
              it curiosity, a specific service, or just looking to improve your
              online presence?
            </Text>
            <Text>
              Simply hit <strong> Reply</strong> and let me know. I personally
              read and respond to every message.
            </Text>
          </Section>

          {/* Footer */}
          <Section>
            <Text>
              Cheers, <br />
              Constantin <br />
              Founder & CEO, Rathon <br />
              <Link href="https://www.rathon-rw.com">Rathon-rw.com</Link>
            </Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
};
