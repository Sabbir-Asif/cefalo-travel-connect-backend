import nodemailer from 'nodemailer';
import { InternalException } from '../exceptions/internal-exception';
import { ErrorCode } from '../exceptions/root';
import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '../configs/secrets';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
}); 

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const verificationUrl = `${process.env.APP_BASE_URL}/api/email-verifications/verify?token=${token}`;

  const htmlContent = `
    <p>Hello ${name},</p>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>This link will expire in 30 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"CTC Auth" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Verify your email address',
      html: htmlContent,
    });
  } catch (err) {
    console.log(err);
    throw new InternalException((err as Error).message, 'Failed to send verification email',ErrorCode.INTERNAL_EXCEPTION);
  }
}
