import { z } from 'zod'

// Product validation schemas
export const createProductSchema = z.object({
  shopId: z.string(),
  platformId: z.string(),
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  warrantyPolicy: z.string().min(10),
  howToUse: z.string().min(10),
  planType: z.enum(['Personal', 'Family', 'Slot', 'Shared', 'InviteLink']),
  durationDays: z.number().int().min(1),
  price: z.number().min(0)
})

export const updateProductSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).optional(),
  warrantyPolicy: z.string().min(10).optional(),
  howToUse: z.string().min(10).optional(),
  planType: z.enum(['Personal', 'Family', 'Slot', 'Shared', 'InviteLink']).optional(),
  durationDays: z.number().int().min(1).optional(),
  price: z.number().min(0).optional()
})
