import { z } from "zod";

export const userProfileFormSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .toLowerCase()
    .trim()
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Username may only contain alphanumeric characters.",
    ),
  fullName: z.string().min(3).max(32),
  email: z.email(),
});

export type TUserProfileFormValues = z.infer<typeof userProfileFormSchema>;

export const deleteUserFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Please type 'delete my account' to confirm." })
    .refine((val) => val.trim().toLowerCase() === "delete my account", {
      message: "You must type exactly: delete my account",
    }),
});
export type TDeleteUserFormValues = z.infer<typeof deleteUserFormSchema>;
