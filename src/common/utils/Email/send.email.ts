import nodemailer from 'nodemailer';

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const SendEmail = async ({
  to,
  subject,
  html,
}: SendEmailProps): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('EMAIL_USER or EMAIL_PASS is missing');
  }
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: `E-COMMERCE-PLATFORM <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
