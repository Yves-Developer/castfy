/** biome-ignore-all lint/correctness/noChildrenProp: <explanation */
"use client";

import { Button } from "@castfy/ui/components/button";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@castfy/ui/components/card";
import { Field, FieldError, FieldLabel } from "@castfy/ui/components/field";
import { Input } from "@castfy/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/custom/responive-dialog";
// import { api } from "@/convex/_generated/api";
// import { authClient } from "@/lib/auth/auth-client";
import { deleteUserFormSchema } from "./schema";

// Schema

export default function DeleteUserCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, _setIsSubmitting] = useState(false);
  // const deleteUserDataMutation = useMutation(api.user.deleteUserData);
  // const router = useRouter();

  const form = useForm({
    defaultValues: {
      title: "",
    },
    validators: {
      onSubmit: deleteUserFormSchema,
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

  // const handleSubmit =  async() => {
  //   console.log("handleSubmit");
  //   setIsSubmitting(true);
  //   try {
  //     await deleteUserDataMutation();
  //     await authClient.deleteUser();
  //     toast.success("Account deleted successfully");
  //     setIsOpen(false);
  //     router.refresh();
  //   } catch (error) {
  //     console.error(error);
  //     if (error instanceof ConvexError) {
  //       toast.error(error.data.message || "Failed to delete account");
  //     } else {
  //       toast.error(
  //         error instanceof Error ? error.message : "Failed to delete account",
  //       );
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return (
    <>
      <div className="space-y-5">
        <CardHeader className="px-0">
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Be careful. Account deletion cannot be undone.
          </CardDescription>
        </CardHeader>
        <Button onClick={() => setIsOpen(true)} variant="destructive">
          Delete account
        </Button>
      </div>

      <ResponsiveDialog
        description="This will permanently delete all your files, chats, activity, and
              all other resources belonging to your Personal Account."
        isSubmitting={isSubmitting}
        open={isOpen}
        setOpenAction={setIsOpen}
        showDrawerTitle
        submitBtn={
          <Button
            disabled={isSubmitting}
            form="form-delete-account"
            type="submit"
            variant="destructive"
          >
            {isSubmitting ? "Deleting..." : "Delete Account"}
          </Button>
        }
        title="Delete Personal Account"
      >
        <form
          className="flex flex-col gap-6 p-4 lg:gap-10 lg:p-0"
          id="form-delete-account"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    className="text-sm tracking-tight"
                    htmlFor="form-delete-account-input"
                  >
                    Type <strong>delete my account</strong> to confirm:
                  </FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    id="form-delete-account-input"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="delete my account"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="title"
          />
        </form>
      </ResponsiveDialog>
    </>
  );
}
