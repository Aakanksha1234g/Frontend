import { z } from 'zod';

export const signupSchema = z
  .object({
    username: z.string().trim().min(2, 'Name must be at least 2 characters'),

    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .max(320, 'Email length must be less than 320 characters')
      .email('Please enter a valid email address'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])/,
        'Password must contain at least one uppercase and one lowercase letter'
      ),

    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
