interface ComplianceStatusCardProps {
  title: string
  status: 'compliant' | 'warning' | 'non-compliant'
  count: number
  total?: number
  icon?: React.ReactNode
}

export default function ComplianceStatusCard({ title, status, count, total, icon }: ComplianceStatusCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'compliant':
        return 'bg-emerald-50 border-emerald-200'
      case 'warning':
        return 'bg-amber-50 border-amber-200'
      case 'non-compliant':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  const getStatusTextColor = () => {
    switch (status) {
      case 'compliant':
        return 'text-emerald-700'
      case 'warning':
        return 'text-amber-700'
      case 'non-compliant':
        return 'text-red-700'
      default:
        return 'text-slate-700'
    }
  }

  const getStatusIconColor = () => {
    switch (status) {
      case 'compliant':
        return 'bg-emerald-100 text-emerald-600'
      case 'warning':
        return 'bg-amber-100 text-amber-600'
      case 'non-compliant':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const percentage = total ? Math.round((count / total) * 100) : null

  return (
    <div className={`rounded-lg border p-6 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${getStatusTextColor()}`}>{count}</p>
            {total && (
              <p className="text-sm text-slate-500">
                / {total} ({percentage}%)
              </p>
            )}
          </div>
        </div>
        {icon && (
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getStatusIconColor()}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
