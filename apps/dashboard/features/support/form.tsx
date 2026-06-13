/** biome-ignore-all lint/correctness/noChildrenProp: allow */
"use client";

import { Button } from "@castfy/ui/components/button";
import { Checkbox } from "@castfy/ui/components/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@castfy/ui/components/field";
import { Input } from "@castfy/ui/components/input";
import { Textarea } from "@castfy/ui/components/textarea";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { contactSalesTeam } from "@/server/contact.action";
import { contactFormSchema } from "@/server/schema";

export function SupportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    defaultValues: {
      workEmail: "",
      role: "",
      companyName: "",
      firstName: "",
      lastName: "",
      needs: "",
      receiveUpdates: false,
    },
    validators: {
      onSubmit: contactFormSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      const createPromise = contactSalesTeam(value);

      toast.promise(createPromise, {
        loading: "Submitting your message...",
      });

      try {
        const result = await createPromise;

        if (result?.success) {
          form.reset();

          toast.success("Message sent successfully", {
            description: "We will get back to you as soon as possible.",
          });
        }
      } catch {
        toast.error("Failed to send message. Please try again.", {
          description: "There was an error sending your message.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="mx-auto flex w-full flex-col justify-center gap-15 sm:max-w-140">
      <form
        className="flex w-full flex-col gap-6"
        id="newsletter-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Work email *</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    className="min-h-10 bg-background dark:bg-background"
                    disabled={isSubmitting}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="workEmail"
          />
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Company name *</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      className="min-h-10 bg-background dark:bg-background"
                      disabled={isSubmitting}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="companyName"
            />
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Your role *</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      className="min-h-10 bg-background dark:bg-background"
                      disabled={isSubmitting}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="role"
            />
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>First name *</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      className="min-h-10 bg-background dark:bg-background"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="firstName"
            />

            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Last name *</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      className="min-h-10 bg-background dark:bg-background"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="lastName"
            />
          </div>

          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Can you share more about your business needs and challenges?
                  </FieldLabel>
                  <Textarea
                    aria-invalid={isInvalid}
                    className="min-h-15 bg-background dark:bg-background"
                    disabled={isSubmitting}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="needs"
          />

          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field
                  className="flex items-start gap-3"
                  data-invalid={isInvalid}
                  orientation={"horizontal"}
                >
                  <Checkbox
                    aria-invalid={isInvalid}
                    checked={field.state.value}
                    disabled={isSubmitting}
                    id="receiveUpdates"
                    name={field.name}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  <FieldLabel
                    className="cursor-pointer font-normal"
                    htmlFor="receiveUpdates"
                  >
                    I would like to receive marketing communications from{" "}
                    {siteConfig.name} via email about its products, services and
                    events. If you do not want to receive marketing
                    communications, please uncheck this box.
                  </FieldLabel>
                </Field>
              );
            }}
            name="receiveUpdates"
          />
        </FieldGroup>

        <Button
          className="w-fit rounded-full"
          disabled={isSubmitting}
          form="newsletter-form"
          size="xl"
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
      <p className="font-medium text-muted-foreground text-sm">
        For other inquiries,{" "}
        <Link className="underline underline-offset-4" href="/">
          book a call
        </Link>
        .
      </p>
    </div>
  );
}
