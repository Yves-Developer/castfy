import * as z from "zod";

export const subscribeFormSchema = z.object({
  email: z.email("Please provide a valid email."),
  receiveUpdates: z.boolean(),
});

export type TSubscribeFormSchema = z.infer<typeof subscribeFormSchema>;

export const contactFormSchema = z.object({
  workEmail: z.email("Enter valid email address"),
  companyName: z.string().min(1, "Please fill out this field"),
  role: z.string().min(1, "Please fill out this field"),
  firstName: z.string().min(1, "Please fill out this field"),
  lastName: z.string().min(1, "Please fill out this field"),
  needs: z.string(),
  receiveUpdates: z.boolean(),
});

export type TContactFormSchema = z.infer<typeof contactFormSchema>;

export const referralFormSchema = z.object({
  interstedIn: z.string().min(1, "Please fill out this field"),
  workEmail: z.email("Enter valid email address"),

  firstName: z.string().min(1, "Please fill out this field"),
  lastName: z.string().min(1, "Please fill out this field"),
  phoneNumber: z.string().min(1, "Please fill out this field"),
  description: z.string(),
  receiveUpdates: z.boolean(),
});

export type TReferralFormSchema = z.infer<typeof referralFormSchema>;
