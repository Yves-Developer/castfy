/** biome-ignore-all lint/correctness/noChildrenProp: <explanation */

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@castfy/ui/components/field";
import { Input } from "@castfy/ui/components/input";
import { useForm } from "@tanstack/react-form";
import type * as React from "react";
import { toast } from "sonner";
// biome-ignore lint/performance/noNamespaceImport: <explanation
import * as z from "zod";
import { siteConfig } from "@/config/site";

const emailFormSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

export function UserEmail() {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: emailFormSchema,
    },
    onSubmit: ({ value }) => {
      toast("You submitted the following values:", {
        description: (
          <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        ),
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
        } as React.CSSProperties,
      });
    },
  });

  return (
    <form
      className="flex flex-col gap-3"
      id="user-email-form"
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
                <FieldLabel className="text-xs" htmlFor={field.name}>
                  Email
                </FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  autoComplete="off"
                  className="h-7 bg-input/50 text-xs focus-visible:ring-1 dark:bg-input/50"
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                <FieldDescription className="text-xs">
                  This email is associated with {siteConfig.name} account. You
                  can change it here.
                </FieldDescription>
              </Field>
            );
          }}
          name="email"
        />
      </FieldGroup>
    </form>
  );
}
