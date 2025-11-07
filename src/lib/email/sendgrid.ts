import sgMail from "@sendgrid/mail";
import { env } from "@/lib/env";

if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  if (!env.SENDGRID_API_KEY || !env.SENDGRID_FROM_EMAIL) {
    throw new Error("SendGrid configuration missing");
  }
  await sgMail.send({
    to,
    from: {
      email: env.SENDGRID_FROM_EMAIL,
      name: env.SENDGRID_FROM_NAME ?? "SavedDigest"
    },
    subject,
    html
  });
}
