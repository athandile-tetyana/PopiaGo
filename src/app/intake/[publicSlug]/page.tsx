import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import DsarIntakeForm from '@/components/dsar/DsarIntakeForm'

interface PageProps {
  params: Promise<{
    publicSlug: string
  }>
}

export default async function PublicIntakePage({ params }: PageProps) {
  const { publicSlug } = await params
  const supabase = createServiceClient()

  const { data: org, error } = await supabase
    .from('organizations')
    .select('name, public_slug')
    .eq('public_slug', publicSlug)
    .maybeSingle()

  if (error || !org) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Subject Access Request</h1>
          <p className="text-slate-600">
            Submit your request to <span className="font-semibold">{org.name}</span>
          </p>
        </div>

        <DsarIntakeForm publicSlug={org.public_slug} orgName={org.name} />

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            This form is provided by PopiaGo, a POPIA Compliance-as-a-Service platform.
            Your request will be processed in accordance with the Protection of Personal Information Act.
          </p>
        </div>
      </div>
    </div>
  )
}
