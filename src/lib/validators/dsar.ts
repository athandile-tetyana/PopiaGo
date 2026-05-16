import { z } from 'zod'

const dsarRequestTypes = ['access', 'deletion', 'correction', 'objection'] as const

export const dsarSubmitSchema = z.object({
  requesterName: z.string().min(2, 'Name must be at least 2 characters'),
  requesterEmail: z.string().email('Invalid email address'),
  requestType: z.enum(dsarRequestTypes, {
    message: 'Please select a request type',
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

export type DsarSubmitInput = z.infer<typeof dsarSubmitSchema>
