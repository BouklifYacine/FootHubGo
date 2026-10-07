import type { ReactElement } from "react";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "FootHubGo <yacine@footygogo.com>";

/**
 * Sends a React Email template. Never throws: an email failure is logged
 * but must not break the action that triggered it.
 */
export async function sendEmail({
  to,
  subject,
  email,
}: {
  to: string;
  subject: string;
  email: ReactElement;
}) {
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, react: email });
    if (error) console.error("[email]", error);
    return !error;
  } catch (error) {
    console.error("[email]", error);
    return false;
  }
}
