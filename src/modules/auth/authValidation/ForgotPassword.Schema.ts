import z from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .refine((email) => {
      const blacklistedDomains = [
        'tempmail.com',
        'mailinator.com',
        '10minutemail.com',
      ];
      const domain = email.split('@')[1]?.toLowerCase();
      return !blacklistedDomains.includes(domain);
    }, 'This email domain is not allowed'),
});
