/** biome-ignore-all lint/correctness/noChildrenProp: <explanation */

import {
  Field,
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

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
});

export function UserNames() {
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
    validators: {
      onSubmit: formSchema,
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
      id="new-demo-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup className="flex-row gap-3">
        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-xs" htmlFor={field.name}>
                  First Name
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
                <FieldLabel className="text-xs" htmlFor={field.name}>
                  Last Name
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
              </Field>
            );
          }}
          name="lastName"
        />
      </FieldGroup>
    </form>
  );
}
