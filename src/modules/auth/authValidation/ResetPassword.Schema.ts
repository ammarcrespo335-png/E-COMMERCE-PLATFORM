import { z } from 'zod';

export const ResetPasswordSchema = z.object({
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
  otp: z.string().length(7, 'OTP must be 7 digits'),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(/[A-Z]/, 'must have uppercase')
    .regex(/\d/, 'must have number'),
});
