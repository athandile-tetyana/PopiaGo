'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface SignupResult {
  success: boolean
  error?: string
  requiresEmailConfirmation?: boolean
}

export async function signup(formData: {
  email: string
  password: string
  organizationName: string
}): Promise<SignupResult> {
  const supabase = await createClient()

  try {
    // Step 1: Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return { success: false, error: authError.message }
    }

    // If email confirmation is enabled, no session/user is returned
    if (!authData.user) {
      return { 
        success: false, 
        requiresEmailConfirmation: true,
        error: 'Please check your email to confirm your account before continuing.'
      }
    }

    // Step 2: Generate public_slug from organization name (simple lowercase)
    const publicSlug = formData.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Step 3: Create organization using service role (bypass RLS for initial org creation)
    // We need to use service role key here since the user won't have RLS permissions immediately
    const { createServiceClient } = await import('@/lib/supabase/service')
    const serviceSupabase = await createServiceClient()

    const { data: orgData, error: orgError } = await serviceSupabase
      .from('organizations')
      .insert({
        name: formData.organizationName,
        public_slug: publicSlug,
      })
      .select()
      .single()

    if (orgError) {
      console.error('Organization creation error:', orgError)
      return { success: false, error: `Failed to create organization: ${orgError.message}` }
    }

    if (!orgData) {
      return { success: false, error: 'Failed to retrieve created organization' }
    }

    // Step 4: Add user as org member with admin role
    const { error: memberError } = await serviceSupabase
      .from('org_members')
      .insert({
        org_id: orgData.id,
        user_id: authData.user.id,
        role: 'admin',
      })

    if (memberError) {
      console.error('Org member creation error:', memberError)
      return { success: false, error: `Failed to add user to organization: ${memberError.message}` }
    }

    revalidatePath('/dashboard')
    return { success: true }

  } catch (error) {
    console.error('Signup error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}
