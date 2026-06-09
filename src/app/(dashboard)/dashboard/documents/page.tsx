import DocumentUploadForm from '@/components/documents/DocumentUploadForm';
import DocumentList from '@/components/documents/DocumentList';
import Link from 'next/link';

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1 mb-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Document Management</h1>
            <p className="text-slate-600 mt-1">Manage policies, procedures, and compliance evidence.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <DocumentUploadForm />
          </div>
          <div className="lg:col-span-2">
            <DocumentList />
          </div>
        </div>
      </div>
    </div>
  );
}
