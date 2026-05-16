import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dsarSubmitSchema } from '@/lib/validators/dsar'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = dsarSubmitSchema.parse(body)

    const supabase = await createClient()

    // Get organization by public_slug from the request body
    const { publicSlug } = body

    if (!publicSlug) {
      return NextResponse.json({ error: 'Organization slug required' }, { status: 400 })
    }

    // Look up organization by public slug
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('public_slug', publicSlug)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Insert DSAR request
    const { error } = await supabase
      .from('dsar_requests')
      .insert({
        org_id: org.id,
        requester_name: validatedData.requesterName,
        requester_email: validatedData.requesterEmail,
        request_type: validatedData.requestType,
        description: validatedData.description,
        status: 'pending',
      })

    if (error) {
      console.error('DSAR submission error:', error)
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DSAR submission error:', error)
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
}
