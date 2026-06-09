import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface PaiaDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PaiaDetailPage({ params }: PaiaDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organization
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!orgMember) {
    redirect('/dashboard')
  }

  // Get PAIA manual details
  const { data: manual, error } = await supabase
    .from('paia_manuals')
    .select('*')
    .eq('id', id)
    .eq('org_id', orgMember.org_id)
    .maybeSingle()

  if (error || !manual) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/paia"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Manuals
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">{manual.business_name}</h1>
            <div className="text-sm text-slate-500">
              Generated on {new Date(manual.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Manual Content</h2>
          </div>
          <div className="p-8">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                {manual.generated_markdown}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
