import Link from 'next/link'

interface ProcessingActivity {
  id: string
  name: string
  purpose: string
  data_categories: string[]
  data_subjects: string[]
  third_parties: string[]
  retention_period: string | null
  security_measures: string | null
  created_at: string
  updated_at: string
}

interface RopaTableProps {
  activities: ProcessingActivity[]
  deleteAction?: (formData: FormData) => void | Promise<void>
}

export default function RopaTable({ activities, deleteAction }: RopaTableProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No processing activities</h3>
        <p className="mt-1 text-sm text-slate-500">Get started by adding your first processing activity.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Purpose
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Data Categories
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Data Subjects
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Retention
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Updated
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {activities.map((activity) => (
            <tr key={activity.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900">{activity.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-600 max-w-xs truncate">{activity.purpose}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-600">
                  {activity.data_categories?.slice(0, 2).join(', ')}
                  {activity.data_categories && activity.data_categories.length > 2 && '...'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-600">
                  {activity.data_subjects?.slice(0, 2).join(', ')}
                  {activity.data_subjects && activity.data_subjects.length > 2 && '...'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-600">{activity.retention_period || '-'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-600">
                  {new Date(activity.updated_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/dashboard/ropa/${activity.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </Link>
                  {deleteAction ? (
                    <form action={deleteAction}>
                      <input type="hidden" name="activityId" value={activity.id} />
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </form>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
