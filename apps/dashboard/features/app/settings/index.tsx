/** biome-ignore-all lint/correctness/noChildrenProp: <explanation */
"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@castfy/ui/components/avatar";
import { Button } from "@castfy/ui/components/button";
import { Field, FieldError, FieldLabel } from "@castfy/ui/components/field";
import { Input } from "@castfy/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { getUserInitials } from "@/lib/utils";
import profile from "@/public/profile.svg";
import { userProfileFormSchema } from "./schema";

export function UserProfileCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
    },
    validators: {
      onSubmit: userProfileFormSchema,
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
    <div className="space-y-5 lg:py-6" id="profile">
      <div className="flex gap-4">
        <Avatar className="size-16">
          <AvatarImage src={profile.src} />
          <AvatarFallback>{getUserInitials("qwerty")}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Profile picture</p>
          <div className="flex items-center gap-2">
            <Button variant="outline">Upload avatar</Button>
            <Button variant="ghost">Remove</Button>
          </div>
        </div>
      </div>
      <form
        className="space-y-5"
        id="user-profile-form"
        onSubmit={(e) => {
          setIsSubmitting(true);
          e.preventDefault();
          form.handleSubmit();
          setIsSubmitting(false);
        }}
      >
        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="form-username">Username</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  autoComplete="off"
                  className="-ms-px"
                  disabled={isSubmitting}
                  id="form-username"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="username"
                  value={field.state.value}
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="username"
        />
        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="form-fullName">Full Name</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  disabled={isSubmitting}
                  id="form-fullName"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Full Name"
                  value={field.state.value}
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="fullName"
        />
        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="form-email">Email</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  disabled={isSubmitting}
                  id="form-email"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Email"
                  value={field.state.value}
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="email"
        />
      </form>
      <Button>Update</Button>
    </div>
  );
}
