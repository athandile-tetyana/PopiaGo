'use client'

import { useState } from 'react'
import { type RopaFormInput } from '@/lib/validators/ropa'

interface RopaFormProps {
  initialData?: Partial<RopaFormInput>
  onSubmit: (data: RopaFormInput) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export default function RopaForm({ initialData, onSubmit, onCancel, submitLabel = 'Save Activity' }: RopaFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<RopaFormInput>({
    name: initialData?.name || '',
    purpose: initialData?.purpose || '',
    dataCategories: initialData?.dataCategories || [],
    dataSubjects: initialData?.dataSubjects || [],
    thirdParties: initialData?.thirdParties || [],
    retentionPeriod: initialData?.retentionPeriod || '',
    securityMeasures: initialData?.securityMeasures || '',
  })

  const [categoryInput, setCategoryInput] = useState('')
  const [subjectInput, setSubjectInput] = useState('')
  const [thirdPartyInput, setThirdPartyInput] = useState('')

  const addCategory = () => {
    if (categoryInput.trim()) {
      setFormData({
        ...formData,
        dataCategories: [...formData.dataCategories, categoryInput.trim()],
      })
      setCategoryInput('')
    }
  }

  const removeCategory = (index: number) => {
    setFormData({
      ...formData,
      dataCategories: formData.dataCategories.filter((_, i) => i !== index),
    })
  }

  const addSubject = () => {
    if (subjectInput.trim()) {
      setFormData({
        ...formData,
        dataSubjects: [...formData.dataSubjects, subjectInput.trim()],
      })
      setSubjectInput('')
    }
  }

  const removeSubject = (index: number) => {
    setFormData({
      ...formData,
      dataSubjects: formData.dataSubjects.filter((_, i) => i !== index),
    })
  }

  const addThirdParty = () => {
    if (thirdPartyInput.trim()) {
      setFormData({
        ...formData,
        thirdParties: [...formData.thirdParties, thirdPartyInput.trim()],
      })
      setThirdPartyInput('')
    }
  }

  const removeThirdParty = (index: number) => {
    setFormData({
      ...formData,
      thirdParties: formData.thirdParties.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit(formData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Please check your input and try again'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          Activity Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Customer Data Processing"
        />
      </div>

      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 mb-1">
          Purpose *
        </label>
        <textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          required
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe why this data is being processed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Data Categories *
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Email addresses"
          />
          <button
            type="button"
            onClick={addCategory}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.dataCategories.map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {category}
              <button
                type="button"
                onClick={() => removeCategory(index)}
                className="hover:text-blue-900"
              >
                x
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Data Subjects *
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Customers"
          />
          <button
            type="button"
            onClick={addSubject}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.dataSubjects.map((subject, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
            >
              {subject}
              <button
                type="button"
                onClick={() => removeSubject(index)}
                className="hover:text-emerald-900"
              >
                x
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Third Party Recipients
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={thirdPartyInput}
            onChange={(e) => setThirdPartyInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addThirdParty())}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Cloud service provider"
          />
          <button
            type="button"
            onClick={addThirdParty}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.thirdParties.map((party, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
            >
              {party}
              <button
                type="button"
                onClick={() => removeThirdParty(index)}
                className="hover:text-purple-900"
              >
                x
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="retention" className="block text-sm font-medium text-slate-700 mb-1">
          Retention Period
        </label>
        <input
          id="retention"
          type="text"
          value={formData.retentionPeriod}
          onChange={(e) => setFormData({ ...formData, retentionPeriod: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 5 years after account closure"
        />
      </div>

      <div>
        <label htmlFor="security" className="block text-sm font-medium text-slate-700 mb-1">
          Security Measures
        </label>
        <textarea
          id="security"
          value={formData.securityMeasures}
          onChange={(e) => setFormData({ ...formData, securityMeasures: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe security measures in place"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
