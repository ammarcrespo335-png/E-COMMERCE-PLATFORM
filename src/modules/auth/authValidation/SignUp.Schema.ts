import z from 'zod';
export const SignUpSchema = z
  .object({
    email: z.email(),
    Name: z.string().trim(),
    password: z
      .string()
      .regex(/[A-Z]/, 'must have uppercase')
      .regex(/\d/, 'must have number'),
    confirmPassword: z.string().trim(),
    role: z.enum(['user']).optional().default('user'),
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
