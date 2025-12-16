// validations/editProfileSchema.ts
import { z } from 'zod';

export const editProfileSchema = z
  .object({
    username: z
      .string()
      .min(2, { message: 'Username must be at least 2 characters' })
      .max(30, { message: 'Username must be at most 30 characters' }),

    oldPassword: z
      .string()
      .min(8, 'Old password must be at least 8 characters')
      .optional()
      .or(z.literal('')),

    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[0-9]/, 'Must include at least one number')
      .optional()
      .or(z.literal('')),

    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        ctx.addIssue({
          path: ['confirmPassword'],
          message: 'Passwords do not match',
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
