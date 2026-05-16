import 'server-only'

import { createClient } from '@supabase/supabase-js'

function getServiceRoleConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL on the server. Add it to your environment before using the Supabase service client.'
    )
  }

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY on the server. Signup cannot create organizations or org memberships without it.'
    )
  }

  return { supabaseUrl, serviceRoleKey }
}

export function createServiceClient() {
  const { supabaseUrl, serviceRoleKey } = getServiceRoleConfig()

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}
