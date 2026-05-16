'use client'

import { useState } from 'react'
import { dsarSubmitSchema, type DsarSubmitInput } from '@/lib/validators/dsar'

interface DsarIntakeFormProps {
  onSubmit: (data: DsarSubmitInput) => Promise<void>
  orgName?: string
}

export default function DsarIntakeForm({ onSubmit, orgName }: DsarIntakeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<DsarSubmitInput>({
    requesterName: '',
    requesterEmail: '',
    requestType: 'access',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await onSubmit(formData)
      setSuccess(true)
      setFormData({
        requesterName: '',
        requesterEmail: '',
        requestType: 'access',
        description: '',
      })
    } catch (err) {
      setError('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Request Submitted</h3>
          <p className="text-slate-600 mb-6">
            Your data subject access request has been submitted successfully. {orgName && `${orgName} `}will review your request and respond within the required timeframe.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Subject Access Request</h2>
      <p className="text-slate-600 mb-6">
        {orgName ? `Submit a request to ${orgName}` : 'Submit your data subject access request'}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Your Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.requesterName}
            onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.requesterEmail}
            onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
            Request Type *
          </label>
          <select
            id="type"
            value={formData.requestType}
            onChange={(e) => setFormData({ ...formData, requestType: e.target.value as any })}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="access">Access to Information</option>
            <option value="deletion">Deletion of Personal Information</option>
            <option value="correction">Correction of Personal Information</option>
            <option value="objection">Objection to Processing</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={5}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please provide details about your request, including specific information you are seeking or actions you want taken..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>

        <p className="text-xs text-slate-500 text-center">
          By submitting this form, you confirm that the information provided is accurate. 
          Your request will be processed in accordance with POPIA requirements.
        </p>
      </form>
    </div>
  )
}
