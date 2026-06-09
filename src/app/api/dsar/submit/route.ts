import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { dsarSubmitSchema } from '@/lib/validators/dsar'
import { logAuditEvent } from '@/lib/supabase/audit'

const publicDsarSubmitSchema = dsarSubmitSchema.extend({
  publicSlug: z
    .string()
    .trim()
    .min(1, 'Organization slug required')
    .max(128, 'Organization slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Invalid organization slug'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = publicDsarSubmitSchema.parse(body)
    const supabase = createServiceClient()

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('public_slug', validatedData.publicSlug)
      .maybeSingle()

    if (orgError) {
      return NextResponse.json(
        { error: 'Unable to resolve organization for this request.' },
        { status: 500 }
      )
    }

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { data: dsar, error } = await supabase
      .from('dsar_requests')
      .insert({
        org_id: org.id,
        requester_name: validatedData.requesterName,
        requester_email: validatedData.requesterEmail,
        request_type: validatedData.requestType,
        description: validatedData.description,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Unable to submit request right now. Please try again.' },
        { status: 500 }
      )
    }

    // Log the public submission
    await logAuditEvent({
      orgId: org.id,
      action: 'create',
      entityType: 'dsar_request',
      entityId: dsar.id,
      details: { 
        source: 'public_intake',
        requesterEmail: validatedData.requesterEmail 
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid DSAR request details.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
}
