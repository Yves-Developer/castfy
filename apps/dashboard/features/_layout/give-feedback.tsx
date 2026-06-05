/** biome-ignore-all lint/correctness/noChildrenProp: for now */
"use client";

import { Button } from "@castfy/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@castfy/ui/components/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@castfy/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@castfy/ui/components/radio-group";

import { Textarea } from "@castfy/ui/components/textarea";
import { useForm } from "@tanstack/react-form";
import {
  AngryIcon,
  AnnoyedIcon,
  LaughIcon,
  SmileIcon,
  SmilePlusIcon,
} from "lucide-react";
import type * as React from "react";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  feedback: z.string(),
  type: z.enum(["best", "better", "good", "bad"], {
    message: "You need to select a feeling type.",
  }),
});

export function GiveFeedbackDialog() {
  const form = useForm({
    defaultValues: {
      feedback: "",
      type: "best",
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
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="flex w-full justify-between font-normal"
          size="lg"
          variant={"ghost"}
        >
          Give Feedback
          <SmilePlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="px-3 sm:max-w-sm md:max-w-md">
        <DialogHeader className="px-1">
          <DialogTitle>Give feedback</DialogTitle>
          <DialogDescription>
            Your feedback help to improve the platform
          </DialogDescription>
        </DialogHeader>

        <form
          id="feedback-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="no-scrollbar max-h-[50vh] overflow-y-auto p-1 pb-2">
            <FieldGroup>
              <form.Field
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="sr-only">
                        Feedback
                      </FieldLabel>
                      <Textarea
                        aria-invalid={isInvalid}
                        className="min-h-24 resize-none"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Your feedback"
                        rows={6}
                        value={field.state.value}
                      />

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
                name="feedback"
              />
            </FieldGroup>
          </div>

          <DialogFooter className="flex items-center sm:justify-between">
            <div>
              <form.Field
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="sr-only">
                        Notify me about...
                      </FieldLabel>

                      <RadioGroup
                        className="flex"
                        onValueChange={field.handleChange}
                        value={field.state.value}
                      >
                        <Field className="w-fit">
                          <RadioGroupItem
                            className="sr-only hidden"
                            id="best"
                            value="best"
                          />
                          <FieldLabel
                            className={`cursor-pointer text-muted-foreground ${
                              field.state.value === "best"
                                ? "text-emerald-500"
                                : ""
                            }`}
                            htmlFor="best"
                          >
                            <LaughIcon className="size-6" />
                          </FieldLabel>
                        </Field>

                        <Field className="w-fit">
                          <RadioGroupItem
                            className="sr-only hidden"
                            id="better"
                            value="better"
                          />
                          <FieldLabel
                            className={`cursor-pointer text-muted-foreground ${
                              field.state.value === "better"
                                ? "text-sky-500"
                                : ""
                            }`}
                            htmlFor="better"
                          >
                            <SmileIcon className="size-6" />
                          </FieldLabel>
                        </Field>

                        <Field className="w-fit">
                          <RadioGroupItem
                            className="sr-only hidden"
                            id="good"
                            value="good"
                          />
                          <FieldLabel
                            className={`cursor-pointer text-muted-foreground ${
                              field.state.value === "good"
                                ? "text-amber-400"
                                : ""
                            }`}
                            htmlFor="good"
                          >
                            <AnnoyedIcon className="size-6" />
                          </FieldLabel>
                        </Field>

                        <Field className="w-fit">
                          <RadioGroupItem
                            className="sr-only hidden"
                            id="bad"
                            value="bad"
                          />
                          <FieldLabel
                            className={`cursor-pointer text-muted-foreground ${
                              field.state.value === "bad" ? "text-rose-500" : ""
                            }`}
                            htmlFor="bad"
                          >
                            <AngryIcon className="size-6" />
                          </FieldLabel>
                        </Field>
                      </RadioGroup>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
                name="type"
              />
            </div>

            <Button form="feedback-form" type="submit">
              Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
