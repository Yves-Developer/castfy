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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@castfy/ui/components/select";
import { useForm } from "@tanstack/react-form";
import type * as React from "react";
import { toast } from "sonner";
// biome-ignore lint/performance/noNamespaceImport: <explanation
import * as z from "zod";

const formSchema = z.object({
  folder: z.string().min(1, "Please select a folder to move the demo."),
});

const folders = [
  { label: "All", value: "all" },
  { label: "Test", value: "test" },
] as const;
export function MoveDemo({
  open,
  openChangeAction,
}: {
  open: boolean;
  openChangeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm({
    defaultValues: {
      folder: "all",
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
    <Dialog onOpenChange={openChangeAction} open={open}>
      <DialogContent className="sm:max-w-68" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-semibold text-xs">
            Move “Rathon Demo”
          </DialogTitle>
          <DialogDescription className="sr-only">Move demo</DialogDescription>
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
                    <FieldLabel className="sr-only" htmlFor="folder">
                      Folder
                    </FieldLabel>

                    <Select
                      name={field.name}
                      onValueChange={field.handleChange}
                      value={field.state.value}
                    >
                      <SelectTrigger
                        aria-invalid={isInvalid}
                        className="w-full"
                        id="folder"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {folders.map((folder) => (
                          <SelectItem key={folder.value} value={folder.value}>
                            {folder.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="folder"
            />
          </FieldGroup>
          <p className="text-muted-foreground text-xs">
            The demo can only be moved within the current workspace
          </p>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button className="flex-1 text-xs" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button className="flex-1 text-xs" type="submit">
              Move
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
