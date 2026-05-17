// Pattern: Service
import { env } from '../config/env.js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface BrevoRecipient {
  email: string;
  name?: string;
}

interface BrevoPayload {
  sender: BrevoRecipient;
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
}

const verificationEmailTemplate = (link: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Verify your email</h2>
    <p>Click the link below to verify your email address:</p>
    <p><a href="${link}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a></p>
    <p>Or copy this URL: ${link}</p>
    <p>If you did not register, ignore this email.</p>
  </div>
`;

const resetPasswordEmailTemplate = (link: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Reset your password</h2>
    <p>Click the link below to reset your password. Link expires in 1 hour.</p>
    <p><a href="${link}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
    <p>Or copy this URL: ${link}</p>
    <p>If you did not request a reset, ignore this email.</p>
  </div>
`;

/**
 * Sends a transactional email through Brevo HTTP API.
 * @param payload - Brevo email payload
 * @throws Error when Brevo returns non-2xx
 */
const sendEmail = async (payload: BrevoPayload): Promise<void> => {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo email failed (${res.status}): ${body}`);
  }
};

/**
 * Sends an email-verification link to a newly registered user.
 * @param toEmail - recipient email
 * @param toName - recipient display name
 * @param token - verification token (URL-safe)
 */
export const sendVerificationEmail = async (
  toEmail: string,
  toName: string,
  token: string
): Promise<void> => {
  const link = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmail({
    sender: { email: env.BREVO_SENDER_EMAIL, name: 'Music App' },
    to: [{ email: toEmail, name: toName }],
    subject: 'Verify your email',
    htmlContent: verificationEmailTemplate(link),
  });
};

/**
 * Sends a password-reset link to a user.
 * @param toEmail - recipient email
 * @param toName - recipient display name
 * @param token - reset token (URL-safe)
 */
export const sendResetPasswordEmail = async (
  toEmail: string,
  toName: string,
  token: string
): Promise<void> => {
  const link = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail({
    sender: { email: env.BREVO_SENDER_EMAIL, name: 'Music App' },
    to: [{ email: toEmail, name: toName }],
    subject: 'Reset your password',
    htmlContent: resetPasswordEmailTemplate(link),
  });
};
