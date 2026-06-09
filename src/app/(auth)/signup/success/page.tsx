import Link from 'next/link'

interface PageProps {
  searchParams?: Promise<{
    email?: string
  }>
}

export default async function SignupSuccessPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const email = resolvedSearchParams?.email

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
          <p className="text-slate-600 mb-8">
            We&apos;ve sent a confirmation link to <span className="font-semibold text-slate-900">{email || 'your email address'}</span>. 
            Please verify your account to continue.
          </p>
          <div className="space-y-4">
            <Link 
              href="/login" 
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Sign In
            </Link>
            <p className="text-sm text-slate-500">
              Didn&apos;t receive an email? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
