import { z } from 'zod'

export const documentTypeSchema = z.enum(['policy', 'procedure', 'agreement', 'other'])

export const complianceDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title is too long'),
  documentType: documentTypeSchema,
  description: z
    .string()
    .trim()
    .max(1000, 'Description is too long')
    .optional()
    .nullable(),
})

export type ComplianceDocumentInput = z.infer<typeof complianceDocumentSchema>
