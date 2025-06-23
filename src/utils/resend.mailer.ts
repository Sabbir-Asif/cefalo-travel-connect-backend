import { Resend } from 'resend';
import { InternalException } from '../exceptions/internal-exception';
import { ErrorCode } from '../exceptions/root';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, name: string, token: string) {
    console.log(`Sending verification email to ${to} with token ${token}`);
    const verificationUrl = `${process.env.APP_BASE_URL}/api/auth/verify-email?token=${token}`;

    const emailHtml = `
    <p>Hello ${name},</p>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>This link will expire in 30 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

    try {
        await resend.emails.send({
            from: `ctc-auth <onboarding@resend.dev>`,
            to: "your email",
            subject: "Verify your email address",
            html: emailHtml,
        });
    } catch (err) {
        throw new InternalException((err as Error).message, 'Failed to send verification email', ErrorCode.INTERNAL_EXCEPTION);
    }
}
