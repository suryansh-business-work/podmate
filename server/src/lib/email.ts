import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import logger from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST ?? 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER ?? '';
  const pass = process.env.SMTP_PASS ?? '';

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const fromEmail = process.env.SMTP_USER ?? 'noreply@partywings.com';

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"PartyWings" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (err) {
    logger.error(`Failed to send email to ${options.to}:`, err);
    return false;
  }
}

/**
 * sendSMS – In dev mode, sends the SMS content via email to the dev email.
 * In production, this will integrate with an SMS provider.
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  const devEmail = process.env.DEV_EMAIL ?? 'suryansh@exyconn.com';

  logger.info(`sendSMS called for ${phone}: ${message.substring(0, 50)}...`);

  return sendEmail({
    to: devEmail,
    subject: `[PartyWings SMS] To: ${phone}`,
    text: `SMS to ${phone}:\n\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3 style="color: #5B4CDB;">PartyWings SMS (Dev Mode)</h3>
        <p><strong>To:</strong> ${phone}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br/>')}</p>
        <hr />
        <small style="color: #999;">This is a dev-mode email. In production, this will be sent via SMS.</small>
      </div>
    `,
  });
}

/**
 * Send admin credentials via email
 */
export async function sendAdminCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'PartyWings Admin - Your Login Credentials',
    text: `Your admin credentials:\n\nEmail: ${email}\nPassword: ${password}\n\nLogin at: http://localhost:4040`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
        <h2 style="color: #5B4CDB;">PartyWings Admin</h2>
        <p>Your admin login credentials:</p>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Password</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${password}</td>
          </tr>
        </table>
        <p>Login at: <a href="http://localhost:4040">http://localhost:4040</a></p>
        <hr />
        <small style="color: #999;">Sent from PartyWings Admin System</small>
      </div>
    `,
  });
}
