import { z } from 'zod'

export const dsarRequestTypes = ['access', 'deletion', 'correction', 'objection'] as const
export const dsarStatuses = ['pending', 'in_review', 'completed', 'rejected'] as const

export const dsarSubmitSchema = z.object({
  requesterName: z.string().min(2, 'Name must be at least 2 characters'),
  requesterEmail: z.string().email('Invalid email address'),
  requestType: z.enum(dsarRequestTypes, {
    message: 'Please select a request type',
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

export const dsarUpdateSchema = z.object({
  status: z.enum(dsarStatuses, {
    message: 'Invalid status',
  }),
  responseText: z.string().optional().nullable(),
})

export type DsarSubmitInput = z.infer<typeof dsarSubmitSchema>
export type DsarUpdateInput = z.infer<typeof dsarUpdateSchema>
