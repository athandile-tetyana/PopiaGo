import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PaiaManualGenerator from '@/components/paia/PaiaManualGenerator'

interface Organization {
  id: string
  name: string
  public_slug: string
}

export default async function PaiaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organization
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id, organizations(*)')
    .eq('user_id', user.id)
    .single()

  if (!orgMember) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">No Organization Found</h1>
            <p className="text-slate-600">You are not a member of any organization.</p>
          </div>
        </div>
      </div>
    )
  }

  const org = (
    Array.isArray(orgMember.organizations)
      ? orgMember.organizations[0]
      : orgMember.organizations
  ) as Organization | null

  if (!org) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">No Organization Found</h1>
            <p className="text-slate-600">You are not a member of any organization.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">PAIA Manual Generator</h1>
          <p className="text-slate-600 mt-1">Generate your Promotion of Access to Information Act manual</p>
        </div>

        <PaiaManualGenerator org={org} />
      </div>
    </div>
  )
}
