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
import { useNewFolderStore } from "@/lib/store/dialogs";

const formSchema = z.object({
  title: z.string().min(5, "Demo title must be at least 5 characters."),
});

export function NewFolder() {
  const { open, isOpen, close } = useNewFolderStore();
  const form = useForm({
    defaultValues: {
      title: "",
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
    <Dialog onOpenChange={isOpen ? close : open} open={isOpen}>
      <DialogContent className="sm:max-w-68" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-semibold text-xs">
            New Folder
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create new folder
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          id="new-demo-form"
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
          <p className="text-muted-foreground text-xs">
            Create a new folder to help organize your projects.
          </p>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button className="flex-1 text-xs" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button className="flex-1 text-xs" type="submit">
              Done
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
