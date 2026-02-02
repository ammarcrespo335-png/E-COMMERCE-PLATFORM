import { z } from 'zod';

export const ConfirmEmailSchema = z.object({
  email: z.string().email('invalid email'),

  otp: z.string().regex(/^\d{7}$/, 'otp must be 7 digits'),
});
