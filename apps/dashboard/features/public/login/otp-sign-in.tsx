"use client";

import { Field, FieldError, FieldLabel } from "@castfy/ui/components/field";
import { Input } from "@castfy/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@castfy/ui/components/input-otp";
import { Spinner } from "@castfy/ui/components/spinner";
import { SubmitButton } from "@castfy/ui/components/submit-button";
import { cn } from "@castfy/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod/v3";

const formSchema = z.object({
  email: z
    .string()
    .email()
    .refine((email) => !email.includes("+"), {
      message: "Email addresses with '+' are not allowed",
    }),
});

type Props = {
  className?: string;
};

export function OTPSignIn({ className }: Props) {
  const [isLoading, setLoading] = useState(false);
  const [isSent, setSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit({ email }: z.infer<typeof formSchema>) {
    setLoading(true);

    setEmail(email);

    setSent(true);
    setLoading(false);
  }

  async function onComplete(token: string) {
    if (!email) return;
    console.log("Verifying OTP for email:", email, "with token:", token);
    setIsVerifying(true);
  }

  if (isSent) {
    return (
      <div className={cn("flex flex-col space-y-4 items-center", className)}>
        <div className="h-15.5 w-full flex items-center justify-center">
          {/* verifyOtp.isExecuting || */}
          {isVerifying ? (
            <div className="flex items-center justify-center h-full bg-background/95 border border-input w-full">
              <div className="flex items-center space-x-2 bg-background px-4 py-2 rounded-md shadow-sm">
                <Spinner size={16} className="text-primary" />
                <span className="text-sm text-foreground font-medium">
                  Verifying...
                </span>
              </div>
            </div>
          ) : (
            <InputOTP
              maxLength={6}
              autoFocus
              onComplete={onComplete}
              // disabled={verifyOtp.isExecuting || isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-15.5 h-15.5" />
                <InputOTPSlot index={1} className="w-15.5 h-15.5" />
                <InputOTPSlot index={2} className="w-15.5 h-15.5" />
                <InputOTPSlot index={3} className="w-15.5 h-15.5" />
                <InputOTPSlot index={4} className="w-15.5 h-15.5" />
                <InputOTPSlot index={5} className="w-15.5 h-15.5" />
              </InputOTPGroup>
            </InputOTP>
          )}
        </div>

        <div className="flex space-x-2">
          <span className="text-sm text-muted-foreground">
            Didn't receive the email?
          </span>
          <button
            onClick={() => setSent(false)}
            type="button"
            className="text-sm text-primary underline font-medium"
          >
            Resend code
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <div className={cn("flex flex-col space-y-4 px-0.5", className)}>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className="sr-only">
                Email
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Enter email address"
                className="min-h-10"
                autoCapitalize="false"
                autoCorrect="false"
                spellCheck="false"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <SubmitButton
          type="submit"
          className="bg-primary px-6 py-4 text-secondary font-medium flex space-x-2 h-10s w-full"
          isSubmitting={isLoading}
        >
          Continue
        </SubmitButton>
      </div>
    </form>
  );
}
