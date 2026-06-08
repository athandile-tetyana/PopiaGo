'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dsarStatuses, type DsarUpdateInput } from '@/lib/validators/dsar'
import { updateDsarStatus } from '@/app/actions/dsar'

interface DsarStatusUpdateFormProps {
  requestId: string
  initialStatus: typeof dsarStatuses[number]
  initialResponseText: string | null
}

export default function DsarStatusUpdateForm({
  requestId,
  initialStatus,
  initialResponseText,
}: DsarStatusUpdateFormProps) {
  const router = useRouter()
  const [status, setStatus] = useState<typeof dsarStatuses[number]>(initialStatus)
  const [responseText, setResponseText] = useState(initialResponseText || '')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(false)

    const result = await updateDsarStatus(requestId, {
      status,
      responseText: responseText.trim() || null,
    })

    setIsPending(false)
    if (result.success) {
      setSuccess(true)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update request')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
          Request Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        >
          {dsarStatuses.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="responseText" className="block text-sm font-medium text-slate-700 mb-1">
          Internal Response / Notes
        </label>
        <textarea
          id="responseText"
          rows={5}
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="Enter the response or internal notes here..."
          className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        />
        <p className="mt-1 text-xs text-slate-500">
          This text is currently for internal use but may be shared with the requester in the future.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
          Request updated successfully.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Saving...' : 'Update Request'}
        </button>
      </div>
    </form>
  )
}
