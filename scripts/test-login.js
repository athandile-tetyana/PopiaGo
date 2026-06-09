const fs = require('fs')
;(async () => {
  try {
    const { createClient } = await import('@supabase/supabase-js')

    const env = process.env
    const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL
    const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY

    if (!url || !key) {
      console.error('Missing SUPABASE URL or ANON KEY in environment')
      process.exit(2)
    }

    const supabase = createClient(url, key)

    const email = process.env.TEST_EMAIL || 'athandiletetyana308@gmail.com'
    const password = process.env.TEST_PASSWORD || '1234567'

    console.log('Attempting sign-in for', email)

    const res = await supabase.auth.signInWithPassword({ email, password })
    console.log('RESULT:', JSON.stringify(res, null, 2))
  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  }
})()
