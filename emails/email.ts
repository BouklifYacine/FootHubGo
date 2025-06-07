import { Resend } from "resend";
import { ReactElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  emailComponent,
}: {
  to: string;
  subject: string;
  emailComponent: ReactElement;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'yacine@footygogo.com',
      to,
      subject,
      react: emailComponent,
    });
    
    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }
    
    return { success: true, info: data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
