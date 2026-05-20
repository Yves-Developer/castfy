import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Check } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  return (
    <section>
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <h3 className="text-center font-medium text-3xl md:text-4xl">
          Pricing
        </h3>
        <p className="text-center text-muted-foreground text-xl">
          Flexible pricing that fits your needs. Pay for exactly what you have.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-medium">Free</CardTitle>

            <span className="my-3 block font-semibold text-2xl">$0 / mo</span>

            <CardDescription className="text-sm">Per editor</CardDescription>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="">Get Started</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <hr className="border-dashed" />

            <ul className="list-outside space-y-3 text-sm">
              {[
                "Basic Analytics Dashboard",
                "5GB Cloud Storage",
                "Email and Chat Support",
              ].map((item, index) => (
                <li className="flex items-center gap-2" key={index}>
                  <Check className="size-3" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader>
            <CardTitle className="font-medium">Pro</CardTitle>

            <span className="my-3 block font-semibold text-2xl">$19 / mo</span>

            <CardDescription className="text-sm">Per editor</CardDescription>

            <Button asChild className="mt-4 w-full">
              <Link href="">Get Started</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <hr className="border-dashed" />

            <ul className="list-outside space-y-3 text-sm">
              {[
                "Everything in Free Plan",
                "5GB Cloud Storage",
                "Email and Chat Support",
                "Access to Community Forum",
                "Single User Access",
                "Access to Basic Templates",
                "Mobile App Access",
                "1 Custom Report Per Month",
                "Monthly Product Updates",
                "Standard Security Features",
              ].map((item, index) => (
                <li className="flex items-center gap-2" key={index}>
                  <Check className="size-3" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-medium">Startup</CardTitle>

            <span className="my-3 block font-semibold text-2xl">$29 / mo</span>

            <CardDescription className="text-sm">Per editor</CardDescription>

            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="">Get Started</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <hr className="border-dashed" />

            <ul className="list-outside space-y-3 text-sm">
              {[
                "Everything in Pro Plan",
                "5GB Cloud Storage",
                "Email and Chat Support",
              ].map((item, index) => (
                <li className="flex items-center gap-2" key={index}>
                  <Check className="size-3" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
