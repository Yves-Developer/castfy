"use server";

import { Resend } from "resend";
import { ContactEmail } from "@/features/_emails/contact-email";
import { contactFormSchema, type TContactFormSchema } from "./schema";

const resendClient = new Resend(process.env.RESEND_API_KEY);

export async function contactSalesTeam(data: TContactFormSchema) {
  try {
    // parse using safeParse it first
    const result = contactFormSchema.safeParse(data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const {
      workEmail,
      companyName,
      role,
      firstName,
      lastName,
      needs,
      receiveUpdates,
    } = result.data;

    const response = await resendClient.emails.send({
      from: "Rathon Contact Form <contact@notifications.rathon-rw.com>",
      to: ["rathonrw@gmail.com", "castfy.app@gmail.com"],
      subject: `Rathon Contact Form: ${companyName} `,
      react: ContactEmail({
        workEmail,
        companyName,
        role,
        firstName,
        lastName,
        needs,
        receiveUpdates,
      }) as React.ReactElement,
      replyTo: workEmail,
      tags: [{ name: "source", value: "website_contact" }],
    });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}
