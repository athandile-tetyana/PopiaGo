import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DsarIntakeForm from '@/components/dsar/DsarIntakeForm'

interface PageProps {
  params: {
    publicSlug: string
  }
}

export default async function PublicIntakePage({ params }: PageProps) {
  const supabase = await createClient()
  const { publicSlug } = params

  // Look up organization by public slug (publicly accessible)
  const { data: org } = await supabase
    .from('organizations')
    .select('name, public_slug')
    .eq('public_slug', publicSlug)
    .single()

  if (!org) {
    notFound()
  }

  const handleSubmit = async (data: any) => {
    'use server'
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dsar/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        publicSlug,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to submit request')
    }
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

        <DsarIntakeForm onSubmit={handleSubmit} orgName={org.name} />

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
