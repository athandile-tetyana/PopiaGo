'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ropaFormSchema, type RopaFormInput } from '@/lib/validators/ropa'

export default function NewRopaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<RopaFormInput>({
    name: '',
    purpose: '',
    dataCategories: [],
    dataSubjects: [],
    thirdParties: [],
    retentionPeriod: '',
    securityMeasures: '',
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
      const validatedData = ropaFormSchema.parse(formData)
      
      // Get user's organization
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id)
        .single()

      if (!orgMember) {
        setError('You are not a member of any organization')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('processing_activities')
        .insert({
          org_id: orgMember.org_id,
          name: validatedData.name,
          purpose: validatedData.purpose,
          data_categories: validatedData.dataCategories,
          data_subjects: validatedData.dataSubjects,
          third_parties: validatedData.thirdParties,
          retention_period: validatedData.retentionPeriod,
          security_measures: validatedData.securityMeasures,
        })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      router.push('/dashboard/ropa')
      router.refresh()
    } catch (err) {
      setError('Please check your input and try again')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard/ropa" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Processing Activities
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Add Processing Activity</h1>
          <p className="text-slate-600 mt-1">Record a new data processing activity for your ROPA</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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
                    ×
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
                    ×
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
                    ×
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
              {loading ? 'Saving...' : 'Save Activity'}
            </button>
            <Link
              href="/dashboard/ropa"
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
