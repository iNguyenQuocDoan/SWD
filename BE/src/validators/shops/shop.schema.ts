import { z } from 'zod'

// Shop validation schemas
export const createShopSchema = z.object({
  shopName: z.string().min(2, 'Shop name must be at least 2 characters').max(100),
  description: z.string().max(500).optional().nullable()
})

export const updateShopSchema = z.object({
  shopName: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable()
})
