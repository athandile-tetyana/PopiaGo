'use client'

import { useRouter } from 'next/navigation'
import RopaForm from '@/components/ropa/RopaForm'
import { updateProcessingActivity } from '@/app/actions/ropa'
import { type RopaFormInput } from '@/lib/validators/ropa'

interface EditRopaFormProps {
  activityId: string
  initialData: RopaFormInput
}

export default function EditRopaForm({ activityId, initialData }: EditRopaFormProps) {
  const router = useRouter()

  const handleUpdate = async (data: RopaFormInput) => {
    const result = await updateProcessingActivity(activityId, data)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update processing activity.')
    }

    router.push('/dashboard/ropa?updated=1')
    router.refresh()
  }

  return (
    <RopaForm
      initialData={initialData}
      onSubmit={handleUpdate}
      onCancel={() => router.push('/dashboard/ropa')}
      submitLabel="Update Activity"
    />
  )
}
