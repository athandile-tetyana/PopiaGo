import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RopaTable from '@/components/ropa/RopaTable'
import { deleteProcessingActivity } from '@/app/actions/ropa'

interface RopaPageProps {
  searchParams?: Promise<{
    status?: string | string[]
    message?: string | string[]
    updated?: string | string[]
  }>
}

function readQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function RopaPage({ searchParams }: RopaPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organization
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id')
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

  // Get processing activities
  const { data: activities, error: activitiesError } = await supabase
    .from('processing_activities')
    .select('*')
    .eq('org_id', orgMember.org_id)
    .order('created_at', { ascending: false })

  const status = readQueryParam(resolvedSearchParams?.status)
  const message = readQueryParam(resolvedSearchParams?.message)
  const updated = readQueryParam(resolvedSearchParams?.updated)

  let statusMessage: { tone: 'success' | 'error'; text: string } | null = null
  if (status === 'created') {
    statusMessage = { tone: 'success', text: 'Processing activity created successfully.' }
  } else if (status === 'updated' || updated === '1') {
    statusMessage = { tone: 'success', text: 'Processing activity updated successfully.' }
  } else if (status === 'deleted') {
    statusMessage = { tone: 'success', text: 'Processing activity deleted successfully.' }
  } else if (status === 'error') {
    statusMessage = {
      tone: 'error',
      text: message || 'Something went wrong while processing your request.',
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Processing Activities</h1>
            <p className="text-slate-600 mt-1">Manage your Register of Processing Activities (ROPA)</p>
          </div>
          <Link
            href="/dashboard/ropa/new"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Activity
          </Link>
        </div>

        {statusMessage ? (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 ${
              statusMessage.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {statusMessage.text}
          </div>
        ) : null}

        {activitiesError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            Failed to load processing activities: {activitiesError.message}
          </div>
        ) : (
          <RopaTable
            activities={activities ?? []}
            deleteAction={deleteProcessingActivity}
          />
        )}
      </div>
    </div>
  )
}
