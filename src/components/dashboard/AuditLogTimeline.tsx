interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id?: string
  details?: any
  created_at: string
}

interface AuditLogTimelineProps {
  logs: AuditLog[]
}

export default function AuditLogTimeline({ logs }: AuditLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No activity yet</h3>
        <p className="mt-1 text-sm text-slate-500">Your compliance activity will appear here.</p>
      </div>
    )
  }

  const getActionIcon = (action: string) => {
    const normalizedAction = action.toLowerCase()
    if (normalizedAction.includes('create') || normalizedAction.includes('insert') || normalizedAction.includes('save')) {
      return (
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      )
    }
    if (normalizedAction.includes('update') || normalizedAction.includes('edit') || normalizedAction.includes('status_change')) {
      return (
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      )
    }
    if (normalizedAction.includes('delete') || normalizedAction.includes('remove')) {
      return (
        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      )
    }
    return (
      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
        <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )
  }

  const getEntityLabel = (entityType: string) => {
    switch (entityType) {
      case 'processing_activity':
        return 'Processing Activity'
      case 'paia_manual':
        return 'PAIA Manual'
      case 'dsar_request':
        return 'DSAR Request'
      case 'compliance_document':
        return 'Compliance Document'
      default:
        return entityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getActionLabel = (action: string, entityType: string) => {
    switch (action) {
      case 'ropa_create': return 'Created Processing Activity'
      case 'ropa_update': return 'Updated Processing Activity'
      case 'ropa_delete': return 'Deleted Processing Activity'
      case 'paia_save': return 'Saved PAIA Manual'
      case 'dsar_update': return 'Updated DSAR Request'
      case 'status_change': return 'Changed status of DSAR Request'
      default:
        const verb = action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ')
        return `${verb} ${getEntityLabel(entityType)}`
    }
  }

  const formatDetails = (log: AuditLog) => {
    const details = log.details
    if (!details) return null

    if (log.action === 'status_change') {
      return `Status changed from ${details.oldStatus} to ${details.newStatus} for ${details.requesterName}`
    }

    if (details.name) {
      return `Activity: ${details.name}`
    }

    if (details.businessName) {
      return `Business: ${details.businessName}`
    }

    if (details.requesterName) {
      return `Requester: ${details.requesterName}`
    }

    if (typeof details === 'string') {
      return details
    }

    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Audit Trail</h2>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Latest 10 events</span>
      </div>
      <div className="relative">
        {/* Vertical line for the timeline */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 ml-[-0.5px]" />
        
        <div className="space-y-8 relative">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 relative">
              <div className="z-10 bg-white">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {getActionLabel(log.action, log.entity_type)}
                  </p>
                  <time className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
                {log.details && (
                  <div className="mt-1">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {formatDetails(log)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
