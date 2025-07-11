import { InternalException } from '../../src/exceptions/internal-exception';
import * as mailer from '../../src/utils/mailer';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

const sendMailMock = jest.fn();

(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock,
});

describe('Mailer Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    const to = 'user@example.com';
    const name = 'John Doe';
    const token = 'verify-token';

    it('sends verification email successfully', async () => {
      sendMailMock.mockResolvedValueOnce({});

      await mailer.sendVerificationEmail(to, name, token);

      expect(sendMailMock).toHaveBeenCalledTimes(1);

      const mailOptions = sendMailMock.mock.calls[0][0];

      expect(mailOptions.to).toBe(to);
      expect(mailOptions.subject).toMatch(/verify/i);
      expect(mailOptions.html).toContain(name);
      expect(mailOptions.html).toContain(token);
    });

    it('throws InternalException if sendMail rejects', async () => {
      sendMailMock.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(mailer.sendVerificationEmail(to, name, token))
        .rejects.toThrow(InternalException);

      expect(sendMailMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendPasswordResetEmail', () => {
    const to = 'user@example.com';
    const name = 'Jane Doe';
    const token = 'reset-token';

    it('sends password reset email successfully', async () => {
      sendMailMock.mockResolvedValueOnce({});

      await mailer.sendPasswordResetEmail(to, name, token);

      expect(sendMailMock).toHaveBeenCalledTimes(1);

      const mailOptions = sendMailMock.mock.calls[0][0];

      expect(mailOptions.to).toBe(to);
      expect(mailOptions.subject).toMatch(/reset/i);
      expect(mailOptions.html).toContain(name);
      expect(mailOptions.html).toContain(token);
    });

    it('throws InternalException if sendMail rejects', async () => {
      sendMailMock.mockRejectedValueOnce(new Error('SMTP down'));

      await expect(mailer.sendPasswordResetEmail(to, name, token))
        .rejects.toThrow(InternalException);

      expect(sendMailMock).toHaveBeenCalledTimes(1);
    });
  });
});
