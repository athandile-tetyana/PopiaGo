import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type RopaFormInput } from '@/lib/validators/ropa'
import EditRopaForm from './EditRopaForm'

interface EditRopaPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditRopaPage({ params }: EditRopaPageProps) {
  const { id } = await params
  const activityId = id?.trim()

  if (!activityId) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!orgMember) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">No Organization Found</h1>
            <p className="text-slate-600">You are not a member of any organization.</p>
          </div>
        </div>
      </div>
    )
  }

  const { data: activity, error: activityError } = await supabase
    .from('processing_activities')
    .select('*')
    .eq('id', activityId)
    .eq('org_id', orgMember.org_id)
    .maybeSingle()

  if (activityError || !activity) {
    notFound()
  }

  const initialData: RopaFormInput = {
    name: activity.name,
    purpose: activity.purpose,
    dataCategories: activity.data_categories || [],
    dataSubjects: activity.data_subjects || [],
    thirdParties: activity.third_parties || [],
    retentionPeriod: activity.retention_period || '',
    securityMeasures: activity.security_measures || '',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard/ropa" className="text-blue-600 hover:text-blue-700 text-sm">
            {'<- Back to Processing Activities'}
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Edit Processing Activity</h1>
          <p className="text-slate-600 mt-1">Update this processing activity in your ROPA.</p>
        </div>

        <EditRopaForm activityId={activity.id} initialData={initialData} />
      </div>
    </div>
  )
}
