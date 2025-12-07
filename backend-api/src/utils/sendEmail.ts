import {
  SESClient,
  SendEmailCommand,
} from "@aws-sdk/client-ses";
import { AUTH_CONFIG } from "../config/authConfig";

// AWS SES client
export const ses = new SESClient({
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

/**
 * Generic email sender
 */
export async function sendEmail(to: string, subject: string, html: string) {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: { Charset: "UTF-8", Data: html },
      },
      Subject: { Charset: "UTF-8", Data: subject },
    },
    Source: AUTH_CONFIG.mailFrom,
  };

  const command = new SendEmailCommand(params);
  await ses.send(command);
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.FRONT_DOMAIN}/verify-email?token=${token}`;

  const subject = "Verify Your Coinvergence Account";

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to Coinvergence</h2>
      <p>Click the button below to verify your email address:</p>

      <a href="${verifyUrl}" 
         style="
            background-color: #d32f2f;
            color: white;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
            margin-top: 20px;
         ">
         Verify Email
      </a>

      <p style="margin-top: 30px; font-size: 14px; color: #555;">
        If you didn’t sign up for Coinvergence, you can ignore this email.
      </p>

      <p style="font-size: 12px; color: #999; margin-top: 20px;">
        This link will expire in 1 hour.
      </p>
    </div>
  `;

  await sendEmail(email, subject, html);
}

