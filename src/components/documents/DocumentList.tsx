import { createClient } from '@/lib/supabase/server';
import { deleteDocument } from '@/app/actions/documents';
import DeleteDocumentButton from './DeleteDocumentButton';

interface ComplianceDocument {
  id: string;
  title: string;
  document_type: string;
  description: string | null;
  file_url: string;
  created_at: string;
}

export default async function DocumentList() {
  const supabase = await createClient();

  const { data: documents, error } = await supabase
    .from('compliance_documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-red-600">Failed to load documents: {error.message}</p>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No documents</h3>
        <p className="mt-1 text-sm text-slate-500">Upload policies and procedures to track your compliance evidence.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Document
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Uploaded
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {documents.map((doc: ComplianceDocument) => (
            <tr key={doc.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-slate-900">{doc.title}</div>
                  {doc.description && (
                    <div className="text-xs text-slate-500 truncate max-w-xs">{doc.description}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                  {doc.document_type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {new Date(doc.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <a
                  href={`/api/documents/download?path=${encodeURIComponent(doc.file_url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-900"
                >
                  Download
                </a>
                <DeleteDocumentButton documentId={doc.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
