import { z } from 'zod/v4'

export const LiquidationTransferSchema = z.object({
  fromId: z.string(),
  toId: z.string(),
  amount: z.number().positive(),
})

export const LiquidationSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  name: z.string().min(1),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  transfers: z.array(LiquidationTransferSchema),
  balances: z.record(z.string(), z.number()),
  totalSpent: z.number().nonnegative(),
  createdAt: z.string().datetime(),
})

export type LiquidationTransfer = z.infer<typeof LiquidationTransferSchema>
export type Liquidation = z.infer<typeof LiquidationSchema>
