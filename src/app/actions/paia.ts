'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { paiaManualSchema, type PaiaManualInput } from '@/lib/validators/paia'
import { logAuditEvent } from '@/lib/supabase/audit'

interface PaiaActionResult {
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
    return { error: 'You must be logged in to manage PAIA manuals.' }
  }

  const { data: orgMember, error: orgError } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (orgError || !orgMember) {
    return { error: 'You are not a member of any organization.' }
  }

  return { supabase, orgId: orgMember.org_id }
}

export async function savePaiaManual(
  formData: PaiaManualInput,
  markdown: string
): Promise<PaiaActionResult> {
  const validated = paiaManualSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Invalid data.' }
  }

  const context = await getOrgContext()
  if ('error' in context) {
    return { success: false, error: context.error }
  }

  const { data: manual, error } = await context.supabase
    .from('paia_manuals')
    .insert({
      org_id: context.orgId,
      business_name: validated.data.businessName,
      registration_number: validated.data.registrationNumber,
      industry: validated.data.industry,
      information_officer_name: validated.data.informationOfficerName,
      information_officer_email: validated.data.informationOfficerEmail,
      information_officer_phone: validated.data.informationOfficerPhone,
      business_address: validated.data.businessAddress,
      record_categories: validated.data.recordCategories,
      data_subject_categories: validated.data.dataSubjectCategories,
      personal_info_categories: validated.data.personalInfoCategories,
      third_party_recipients: validated.data.thirdPartyRecipients,
      cross_border_transfers: validated.data.crossBorderTransfers,
      security_safeguards: validated.data.securitySafeguards,
      request_process: validated.data.requestProcess,
      contact_details: validated.data.contactDetails,
      generated_markdown: markdown,
    })
    .select('id')
    .maybeSingle()

  if (error || !manual) {
    return { success: false, error: error?.message || 'Unable to save PAIA manual.' }
  }

  await logAuditEvent({
    orgId: context.orgId,
    action: 'paia_save',
    entityType: 'paia_manual',
    entityId: manual.id,
    details: { businessName: validated.data.businessName },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/paia')
  return { success: true }
}
