"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { CircleCheckIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { type TWaitlistFormSchema, WaitlistFormSchema } from "@/server/schema";
import { subscribe } from "@/server/subscribe.action";

export default function WaitlistForm() {
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const form = useForm<TWaitlistFormSchema>({
    resolver: zodResolver(WaitlistFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: TWaitlistFormSchema) => {
    setSubmitting(true);
    const createPromise = subscribe(data);
    toast.promise(createPromise, {
      loading: "Subscribing...",
    });
    try {
      const result = await createPromise;
      if (result?.success) {
        setSubscribed(true); // trigger confirmation message
        form.reset();
        toast.success("Subscribed successfully", {
          description: "You have subscribed to Free Sky Ventures.",
        });
      } else {
        console.log(result?.error);
        toast.error("Failed to subscribe. Please try again.", {
          description: "There was an error subscribing to Free Sky Ventures.",
        });
      }
    } catch {
      toast.error("Failed to subscribe. Please try again.", {
        description: "There was an error subscribing to Free Sky Ventures.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (subscribed) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <CircleCheckIcon className="size-5 text-green-500" />
          <p className="text-muted-foreground text-sm">
            Thanks for Joining the waitlist!
          </p>
        </div>
        <Button onClick={() => setSubscribed(false)} variant="link">
          Join again
        </Button>
      </div>
    );
  }
  return (
    <form
      className="relative z-20 mx-auto mt-10 flex w-full max-w-md flex-col items-center justify-center gap-3 md:flex-row"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="sr-only" htmlFor="form-email">
              Email
            </FieldLabel>
            <Input
              aria-invalid={fieldState.invalid}
              aria-label="Email address"
              autoComplete="email"
              className="min-h-10 rounded-full"
              id="form-email"
              placeholder="name@domain.com"
              type="email"
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button
        className="w-full rounded-full md:w-fit"
        disabled={submitting}
        size="xl"
        type="submit"
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" />
            Subscribing...
          </>
        ) : (
          "Subscribe"
        )}
      </Button>
    </form>
  );
}
