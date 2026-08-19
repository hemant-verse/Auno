import { z } from 'zod';

const contactValue = (min, max) =>
  z.string().trim().min(min).max(max).optional().or(z.literal(''));

export const productCreateSchema = z
  .object({
    title: z.string().trim().min(3).max(100),
    description: z.string().trim().min(10).max(1000),
    price: z.coerce.number().finite().min(0),
    isNegotiable: z.coerce.boolean().default(false),
    category: z.enum(['Books', 'Electronics', 'Dorm', 'Fashion', 'Other']),
    condition: z.enum(['New', 'Like New', 'Good', 'Fair']),
    whatsapp: contactValue(8, 20),
    telegram: contactValue(2, 50),
    instagram: contactValue(2, 50),
  })
  .strict()
  .refine(
    (data) => Boolean(data.whatsapp || data.telegram || data.instagram),
    {
      message:
        'At least one contact method (WhatsApp, Telegram, or Instagram) must be provided.',
      path: ['contacts'],
    }
  );

export const productStatusSchema = z
  .object({
    productId: z.string().min(1),
    status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD']),
  })
  .strict();

export const productVerifySchema = z
  .object({
    productId: z.string().min(1),
    verify: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  })
  .strict();