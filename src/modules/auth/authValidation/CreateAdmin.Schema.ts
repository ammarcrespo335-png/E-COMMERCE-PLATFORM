import z from 'zod';
import { RoleEnum } from '../../../DB/models/user.model';
export const CreateAdminSchema = z
  .object({
    email: z.string().email(),
    Name: z.string().trim(),
    password: z
      .string()
      .regex(/[A-Z]/, 'must have uppercase')
      .regex(/\d/, 'must have number'),
    confirmPassword: z.string().trim(),

    age: z.number().positive(),
    role: z.nativeEnum(RoleEnum).default(RoleEnum.Admin),
  })
  .superRefine((args, ctx) => {
    if (args.confirmPassword != args.password) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'confirmPassword must be equal password ',
      });
    }
    const blacklistedDomains = [
      'tempmail.com',
      'mailinator.com',
      '10minutemail.com',
    ];

    if (args.email) {
      const domain = args.email?.split('@')[1]?.toLowerCase();
      if (domain && blacklistedDomains.includes(domain)) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'This email domain is not allowed',
        });
      }
    }
  });
