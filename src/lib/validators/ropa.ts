import { z } from 'zod'

export const ropaFormSchema = z.object({
  name: z.string().min(2, 'Activity name must be at least 2 characters'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  dataCategories: z.array(z.string()).min(1, 'At least one data category is required'),
  dataSubjects: z.array(z.string()).min(1, 'At least one data subject type is required'),
  thirdParties: z.array(z.string()).default([]),
  retentionPeriod: z.string().optional(),
  securityMeasures: z.string().optional(),
})

export type RopaFormInput = z.infer<typeof ropaFormSchema>
