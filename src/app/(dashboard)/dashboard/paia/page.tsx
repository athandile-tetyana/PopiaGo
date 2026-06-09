import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PaiaManualGenerator from '@/components/paia/PaiaManualGenerator'

interface Organization {
  id: string
  name: string
  public_slug: string
}

interface PaiaPageProps {
  searchParams?: Promise<{
    view?: string
  }>
}

export default async function PaiaPage({ searchParams }: PaiaPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const view = resolvedSearchParams?.view

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
    .maybeSingle()

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
    redirect('/dashboard')
  }

  if (view === 'new') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link
              href="/dashboard/paia"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Manuals
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Generate PAIA Manual</h1>
            <p className="text-slate-600 mt-1">Fill in the details to generate your PAIA manual.</p>
          </div>

          <PaiaManualGenerator org={org} />
        </div>
      </div>
    )
  }

  // List view
  const { data: manuals } = await supabase
    .from('paia_manuals')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">PAIA Manuals</h1>
            <p className="text-slate-600 mt-1">Manage your Promotion of Access to Information Act manuals</p>
          </div>
          <Link
            href="/dashboard/paia?view=new"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate New
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {manuals && manuals.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Generated Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {manuals.map((manual) => (
                  <tr key={manual.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{manual.business_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{manual.industry || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {new Date(manual.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/paia/${manual.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Manual
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No manuals generated</h3>
              <p className="mt-1 text-sm text-slate-500">
                Start by generating your first PAIA manual.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/paia?view=new"
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
