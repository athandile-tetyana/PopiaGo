import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DsarStatusUpdateForm from '@/components/dsar/DsarStatusUpdateForm'

interface DsarDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DsarDetailPage({ params }: DsarDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organization
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!orgMember) {
    redirect('/dashboard')
  }

  // Get DSAR request details
  const { data: request, error } = await supabase
    .from('dsar_requests')
    .select('*')
    .eq('id', id)
    .eq('org_id', orgMember.org_id)
    .single()

  if (error || !request) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'in_review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/dsar"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Requests
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">DSAR Request Details</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(request.status)}`}>
              {request.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Request Information</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Requester Name</p>
                    <p className="text-slate-900">{request.requester_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Requester Email</p>
                    <p className="text-slate-900">{request.requester_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Request Type</p>
                    <p className="text-slate-900 capitalize">{request.request_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Submitted On</p>
                    <p className="text-slate-900">{new Date(request.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Description</p>
                  <div className="bg-slate-50 rounded-md p-4 text-slate-700 whitespace-pre-wrap border border-slate-200">
                    {request.description}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Workflow History</h2>
              </div>
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Request Submitted</p>
                    <p className="text-xs text-slate-500">{new Date(request.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {request.updated_at !== request.created_at && (
                  <div className="flex gap-4 mt-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Last Updated</p>
                      <p className="text-xs text-slate-500">{new Date(request.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Update Status</h2>
            <DsarStatusUpdateForm
              requestId={request.id}
              initialStatus={request.status}
              initialResponseText={request.response_text}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
