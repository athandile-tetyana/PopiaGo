'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dsarUpdateSchema, type DsarUpdateInput } from '@/lib/validators/dsar'
import { logAuditEvent } from '@/lib/supabase/audit'

interface DsarActionResult {
  success: boolean
  error?: string
}

async function getOrgContext() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'You must be logged in to manage DSAR requests.' }
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

export async function updateDsarStatus(
  requestId: string,
  data: DsarUpdateInput
): Promise<DsarActionResult> {
  const validated = dsarUpdateSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Invalid data.' }
  }

  const context = await getOrgContext()
  if ('error' in context) {
    return { success: false, error: context.error }
  }

  const { data: existing, error: fetchError } = await context.supabase
    .from('dsar_requests')
    .select('status, requester_name')
    .eq('id', requestId)
    .eq('org_id', context.orgId)
    .single()

  if (fetchError || !existing) {
    return { success: false, error: 'Request not found' }
  }

  const { error } = await context.supabase
    .from('dsar_requests')
    .update({
      status: validated.data.status,
      response_text: validated.data.responseText,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('org_id', context.orgId)

  if (error) {
    return { success: false, error: error.message }
  }

  if (existing.status !== validated.data.status) {
    await logAuditEvent({
      orgId: context.orgId,
      action: 'status_change',
      entityType: 'dsar_request',
      entityId: requestId,
      details: { 
        oldStatus: existing.status, 
        newStatus: validated.data.status,
        requesterName: existing.requester_name
      },
    })
  } else {
    await logAuditEvent({
      orgId: context.orgId,
      action: 'dsar_update',
      entityType: 'dsar_request',
      entityId: requestId,
      details: { requesterName: existing.requester_name },
    })
  }

  revalidatePath('/dashboard/dsar')
  revalidatePath(`/dashboard/dsar/${requestId}`)
  return { success: true }
}
