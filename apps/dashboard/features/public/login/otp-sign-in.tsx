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

export function OTPSignIn({ className }: { className?: string }) {
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

  function onSubmit({ email }: z.infer<typeof formSchema>) {
    setLoading(true);

    setEmail(email);

    setSent(true);
    setLoading(false);
  }

  function onComplete(token: string) {
    if (!email) {
      return;
    }
    console.log("Verifying OTP for email:", email, "with token:", token);
    setIsVerifying(true);
  }

  if (isSent) {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <div className="flex h-15.5 w-full items-center justify-center">
          {/* verifyOtp.isExecuting || */}
          {isVerifying ? (
            <div className="flex h-full w-full items-center justify-center border border-input bg-background/95">
              <div className="flex items-center space-x-2 rounded-md bg-background px-4 py-2 shadow-sm">
                <Spinner className="text-primary" size={16} />
                <span className="font-medium text-foreground text-sm">
                  Verifying...
                </span>
              </div>
            </div>
          ) : (
            <InputOTP
              autoFocus
              maxLength={6}
              onComplete={onComplete}
              // disabled={verifyOtp.isExecuting || isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot className="h-15.5 w-15.5" index={0} />
                <InputOTPSlot className="h-15.5 w-15.5" index={1} />
                <InputOTPSlot className="h-15.5 w-15.5" index={2} />
                <InputOTPSlot className="h-15.5 w-15.5" index={3} />
                <InputOTPSlot className="h-15.5 w-15.5" index={4} />
                <InputOTPSlot className="h-15.5 w-15.5" index={5} />
              </InputOTPGroup>
            </InputOTP>
          )}
        </div>

        <div className="flex space-x-2">
          <span className="text-muted-foreground text-sm">
            Didn't receive the email?
          </span>
          <button
            className="font-medium text-primary text-sm underline"
            onClick={() => setSent(false)}
            type="button"
          >
            Resend code
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
      <div className={cn("flex flex-col space-y-4 px-0.5", className)}>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="sr-only" htmlFor={field.name}>
                Email
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoCapitalize="false"
                autoCorrect="false"
                className="min-h-10"
                id={field.name}
                placeholder="Enter email address"
                spellCheck="false"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <SubmitButton
          className="flex h-10s w-full space-x-2 px-6 py-4 font-medium"
          isSubmitting={isLoading}
          type="submit"
        >
          Continue
        </SubmitButton>
      </div>
    </form>
  );
}
