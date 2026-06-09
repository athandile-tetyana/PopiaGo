'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ropaFormSchema, type RopaFormInput } from '@/lib/validators/ropa'
import { logAuditEvent } from '@/lib/supabase/audit'

interface RopaActionResult {
  success: boolean
  error?: string
}

interface OrgContext {
  supabase: Awaited<ReturnType<typeof createClient>>
  orgId: string
}

async function getOrgContext(): Promise<OrgContext | RopaActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'You must be logged in to manage processing activities.' }
  }

  const { data: orgMember, error: orgError } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (orgError || !orgMember) {
    return { success: false, error: 'You are not a member of any organization.' }
  }

  return { supabase, orgId: orgMember.org_id }
}

function validateRopaInput(formData: RopaFormInput): { data?: RopaFormInput; error?: string } {
  const parsed = ropaFormSchema.safeParse(formData)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid processing activity data.' }
  }

  return { data: parsed.data }
}

function toDbPayload(formData: RopaFormInput) {
  return {
    name: formData.name,
    purpose: formData.purpose,
    data_categories: formData.dataCategories,
    data_subjects: formData.dataSubjects,
    third_parties: formData.thirdParties,
    retention_period: formData.retentionPeriod?.trim() || null,
    security_measures: formData.securityMeasures?.trim() || null,
  }
}

export async function createProcessingActivity(formData: RopaFormInput): Promise<RopaActionResult> {
  const validated = validateRopaInput(formData)
  if (!validated.data) {
    return { success: false, error: validated.error }
  }

  const context = await getOrgContext()
  if (!('supabase' in context)) {
    return context
  }

  const { data, error } = await context.supabase
    .from('processing_activities')
    .insert({
      org_id: context.orgId,
      ...toDbPayload(validated.data),
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  await logAuditEvent({
    orgId: context.orgId,
    action: 'ropa_create',
    entityType: 'processing_activity',
    entityId: data.id,
    details: { name: validated.data.name },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ropa')
  return { success: true }
}

export async function updateProcessingActivity(activityId: string, formData: RopaFormInput): Promise<RopaActionResult> {
  if (!activityId) {
    return { success: false, error: 'Missing processing activity id.' }
  }

  const validated = validateRopaInput(formData)
  if (!validated.data) {
    return { success: false, error: validated.error }
  }

  const context = await getOrgContext()
  if (!('supabase' in context)) {
    return context
  }

  const { data, error } = await context.supabase
    .from('processing_activities')
    .update(toDbPayload(validated.data))
    .eq('id', activityId)
    .eq('org_id', context.orgId)
    .select('id')
    .maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data) {
    return { success: false, error: 'Processing activity not found for your organization.' }
  }

  await logAuditEvent({
    orgId: context.orgId,
    action: 'ropa_update',
    entityType: 'processing_activity',
    entityId: activityId,
    details: { name: validated.data.name },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ropa')
  revalidatePath(`/dashboard/ropa/${activityId}/edit`)
  return { success: true }
}

async function removeProcessingActivity(activityId: string): Promise<RopaActionResult> {
  if (!activityId) {
    return { success: false, error: 'Missing processing activity id.' }
  }

  const context = await getOrgContext()
  if (!('supabase' in context)) {
    return context
  }

  const { data, error } = await context.supabase
    .from('processing_activities')
    .delete()
    .eq('id', activityId)
    .eq('org_id', context.orgId)
    .select('id, name')
    .maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data) {
    return { success: false, error: 'Processing activity not found for your organization.' }
  }

  await logAuditEvent({
    orgId: context.orgId,
    action: 'ropa_delete',
    entityType: 'processing_activity',
    entityId: activityId,
    details: { name: data.name },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ropa')
  return { success: true }
}

export async function deleteProcessingActivity(formData: FormData) {
  const activityId = formData.get('activityId')
  const id = typeof activityId === 'string' ? activityId : ''

  const result = await removeProcessingActivity(id)
  if (!result.success) {
    const message = encodeURIComponent(result.error || 'Failed to delete processing activity.')
    redirect(`/dashboard/ropa?status=error&message=${message}`)
  }

  redirect('/dashboard/ropa?status=deleted')
}
