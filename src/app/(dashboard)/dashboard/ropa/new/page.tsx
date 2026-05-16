'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RopaForm from '@/components/ropa/RopaForm'
import { createProcessingActivity } from '@/app/actions/ropa'
import { type RopaFormInput } from '@/lib/validators/ropa'

export default function NewRopaPage() {
  const router = useRouter()

  const handleCreate = async (data: RopaFormInput) => {
    const result = await createProcessingActivity(data)
    if (!result.success) {
      throw new Error(result.error || 'Failed to create processing activity.')
    }

    router.push('/dashboard/ropa?status=created')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard/ropa" className="text-blue-600 hover:text-blue-700 text-sm">
            {'<- Back to Processing Activities'}
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Add Processing Activity</h1>
          <p className="text-slate-600 mt-1">Record a new data processing activity for your ROPA.</p>
        </div>

        <RopaForm
          onSubmit={handleCreate}
          onCancel={() => router.push('/dashboard/ropa')}
          submitLabel="Save Activity"
        />
      </div>
    </div>
  )
}
