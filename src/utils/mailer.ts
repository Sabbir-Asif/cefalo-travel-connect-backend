import nodemailer from 'nodemailer';
import { InternalException } from '../exceptions/internal-exception';
import { ErrorCode } from '../exceptions/root';
import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '../configs/secrets';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: true,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });
    }
    return transporter;
}

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
        await getTransporter().sendMail({
            from: `CTC Auth <${process.env.SMTP_USER}>`,
            to,
            subject: 'Verify your email address',
            html: htmlContent,
        });
    } catch (err) {
        throw new InternalException(
            (err as Error).message,
            'Failed to send verification email',
            ErrorCode.INTERNAL_EXCEPTION
        );
    }
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_RESET_URL}/confirm?token=${token}`;

    const htmlContent = `
    <p>Hello ${name},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link will expire in 30 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

    try {
        await getTransporter().sendMail({
            from: `CTC Auth <${SMTP_USER}>`,
            to,
            subject: 'Reset your password',
            html: htmlContent,
        });
    } catch (err) {
        throw new InternalException(
            (err as Error).message,
            'Failed to send password reset email',
            ErrorCode.INTERNAL_EXCEPTION
        );
    }
}
