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
    .maybeSingle()

  if (!orgMember) {
    redirect('/dashboard')
  }

  // Get DSAR request details
  const { data: request, error: requestError } = await supabase
    .from('dsar_requests')
    .select('*')
    .eq('id', id)
    .eq('org_id', orgMember.org_id)
    .maybeSingle()

  if (requestError || !request) {
    notFound()
  }

  // Get Audit Logs for this request
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity_id', id)
    .eq('entity_type', 'dsar_request')
    .eq('org_id', orgMember.org_id)
    .order('created_at', { ascending: false })

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

  const getActionLabel = (log: any) => {
    switch (log.action) {
      case 'status_change':
        return `Status changed to ${log.details?.newStatus?.replace('_', ' ')}`
      case 'update':
        return 'Request updated'
      case 'create':
        return 'Request submitted'
      default:
        return log.action.replace('_', ' ')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Request Information</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Requester Name</p>
                    <p className="text-slate-900 font-medium">{request.requester_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Requester Email</p>
                    <p className="text-slate-900 font-medium">{request.requester_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Request Type</p>
                    <p className="text-slate-900 capitalize font-medium">{request.request_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Submitted On</p>
                    <p className="text-slate-900 font-medium">{new Date(request.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Description</p>
                  <div className="bg-slate-50 rounded-md p-4 text-slate-700 whitespace-pre-wrap border border-slate-200 text-sm">
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
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {auditLogs?.map((log, logIdx) => (
                      <li key={log.id}>
                        <div className="relative pb-8">
                          {logIdx !== auditLogs.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                log.action === 'status_change' ? 'bg-blue-100' : 'bg-slate-100'
                              }`}>
                                {log.action === 'status_change' ? (
                                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                ) : (
                                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                )}
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-slate-500">
                                  {getActionLabel(log)}{' '}
                                  {log.details?.oldStatus && (
                                    <span className="font-medium text-slate-900">
                                      (from {log.details.oldStatus})
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-slate-500">
                                <time dateTime={log.created_at}>{new Date(log.created_at).toLocaleString()}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                    {!auditLogs?.length && (
                      <li className="text-sm text-slate-500 italic">No history recorded yet.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Action Center</h2>
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
