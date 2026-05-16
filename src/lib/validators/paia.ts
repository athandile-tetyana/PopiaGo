import { z } from 'zod'

export const paiaManualSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  registrationNumber: z.string().optional(),
  industry: z.string().optional(),
  informationOfficerName: z.string().min(2, 'Information Officer name is required'),
  informationOfficerEmail: z.string().email('Invalid email address'),
  informationOfficerPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  recordCategories: z.array(z.string()).default([]),
  dataSubjectCategories: z.array(z.string()).default([]),
  personalInfoCategories: z.array(z.string()).default([]),
  thirdPartyRecipients: z.array(z.string()).default([]),
  crossBorderTransfers: z.string().optional(),
  securitySafeguards: z.string().optional(),
  requestProcess: z.string().optional(),
  contactDetails: z.string().optional(),
})

export type PaiaManualInput = z.infer<typeof paiaManualSchema>
