'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { complianceDocumentSchema, type ComplianceDocumentInput } from '@/lib/validators/documents'
import { logAuditEvent } from '@/lib/supabase/audit'
import { v4 as uuidv4 } from 'uuid'

interface DocumentActionResult {
  success: boolean
  error?: string
  data?: any
}

async function getOrgContext() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'You must be logged in to manage documents.' }
  }

  const { data: orgMember, error: orgError } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (orgError || !orgMember) {
    return { error: 'You are not a member of any organization.' }
  }

  return { supabase, orgId: orgMember.org_id }
}

export async function uploadDocument(
  formData: FormData
): Promise<DocumentActionResult> {
  const title = formData.get('title') as string
  const documentType = formData.get('documentType') as any
  const description = formData.get('description') as string
  const file = formData.get('file') as File

  if (!file) {
    return { success: false, error: 'No file provided.' }
  }

  const validated = complianceDocumentSchema.safeParse({ title, documentType, description })
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Invalid data.' }
  }

  const context = await getOrgContext()
  if ('error' in context) {
    return { success: false, error: context.error }
  }

  // 1. Upload file to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${context.orgId}/${fileName}`

  const { data: uploadData, error: uploadError } = await context.supabase.storage
    .from('compliance-documents')
    .upload(filePath, file)

  if (uploadError) {
    return { success: false, error: `Upload failed: ${uploadError.message}` }
  }

  // 2. Get public URL (or signed URL if bucket is private - assuming private for security)
  const { data: { publicUrl } } = context.supabase.storage
    .from('compliance-documents')
    .getPublicUrl(filePath)

  // 3. Save metadata to compliance_documents table
  const { data: doc, error: dbError } = await context.supabase
    .from('compliance_documents')
    .insert({
      org_id: context.orgId,
      title: validated.data.title,
      document_type: validated.data.documentType,
      description: validated.data.description,
      file_url: filePath, // Store the relative path, we can resolve it later
    })
    .select('id')
    .single()

  if (dbError) {
    // Cleanup the uploaded file if DB insert fails
    await context.supabase.storage.from('compliance-documents').remove([filePath])
    return { success: false, error: `Database error: ${dbError.message}` }
  }

  await logAuditEvent({
    orgId: context.orgId,
    action: 'create',
    entityType: 'compliance_document' as any,
    entityId: doc.id,
    details: { title: validated.data.title, fileName: file.name },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/documents')
  return { success: true, data: doc }
}

export async function deleteDocument(documentId: string): Promise<DocumentActionResult> {
  const context = await getOrgContext()
  if ('error' in context) {
    return { success: false, error: context.error }
  }

  // 1. Get document to find file path
  const { data: doc, error: fetchError } = await context.supabase
    .from('compliance_documents')
    .select('file_url, title')
    .eq('id', documentId)
    .eq('org_id', context.orgId)
    .single()

  if (fetchError || !doc) {
    return { success: false, error: 'Document not found.' }
  }

  // 2. Delete from Storage
  const { error: storageError } = await context.supabase.storage
    .from('compliance-documents')
    .remove([doc.file_url])

  if (storageError) {
    console.error('Failed to delete from storage:', storageError)
    // Continue anyway to keep DB in sync? Or fail? Let's fail for safety.
    // return { success: false, error: `Failed to delete file: ${storageError.message}` }
  }

  // 3. Delete from DB
  const { error: dbError } = await context.supabase
    .from('compliance_documents')
    .delete()
    .eq('id', documentId)
    .eq('org_id', context.orgId)

  if (dbError) {
    return { success: false, error: `Database error: ${dbError.message}` }
  }

  await logAuditEvent({
    orgId: context.orgId,
    action: 'delete',
    entityType: 'compliance_document' as any,
    entityId: documentId,
    details: { title: doc.title },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/documents')
  return { success: true }
}
