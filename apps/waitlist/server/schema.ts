import z from "zod";

export const WaitlistFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export type TWaitlistFormSchema = z.infer<typeof WaitlistFormSchema>;
