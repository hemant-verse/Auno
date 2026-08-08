// schemas/authSchema.js
import { z } from 'zod';

export const registerSchema = z.object({
  UserName: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase()
    .regex(/^[a-zA-Z0-9._+-]+@indoreinstitute\.com$/,'@indoreinstitute.com email is required')
    .trim(),
  
  Password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password is too long')
    .trim(),
});

export const loginSchema = z.object({
   email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase()
    .regex(/^[a-zA-Z0-9._+-]+@indoreinstitute\.com$/,'@indoreinstitute.com email is required')
    .trim(),
  
  Password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password is too long')
    .trim(),
});