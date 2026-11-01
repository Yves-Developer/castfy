"use client";
import { Button } from "@castfy/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@castfy/ui/components/dialog";
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
import { bridge } from "@/lib/bridge";
import type { Tdemo } from "@/types";

const formSchema = z.object({
  title: z.string().trim().min(1, "Give the demo a name."),
});

/** Renames a project; the library card and the studio pick it up. */
export function RenameDemo({
  demo,
  open,
  openChangeAction,
}: {
  demo: Tdemo;
  open: boolean;
  openChangeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm({
    defaultValues: {
      title: demo.name,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const title = value.title.trim();
      if (title === demo.name) {
        openChangeAction(false);
        return;
      }
      const project = await bridge
        .renameProject(demo.slug, title)
        .catch(() => null);
      if (project) {
        openChangeAction(false);
        toast.success(`Renamed to “${project.title}”`);
      } else {
        toast.error("Could not rename that demo. Try again.");
      }
    },
  });

  return (
    <Dialog
      onOpenChange={(next) => {
        // Start from the current name each time it opens.
        if (next) {
          form.reset({ title: demo.name });
        }
        openChangeAction(next);
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-68" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-semibold text-xs">
            Rename Demo
          </DialogTitle>
          <DialogDescription className="sr-only">Rename demo</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          id="rename-demo-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              // biome-ignore lint/correctness/noChildrenProp: <explanation
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="sr-only" htmlFor={field.name}>
                      Demo Title
                    </FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      autoFocus
                      className="h-7 text-xs focus-visible:ring-1 dark:bg-input/50"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Title"
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="title"
            />
          </FieldGroup>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button className="flex-1 text-xs" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button className="flex-1 text-xs" type="submit" variant="brand">
              Done
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
