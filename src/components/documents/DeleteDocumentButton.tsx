"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDocument } from '@/app/actions/documents';

interface DeleteDocumentButtonProps {
  documentId: string;
}

export default function DeleteDocumentButton({ documentId }: DeleteDocumentButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteDocument(documentId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete document.');
      }
    } catch (err) {
      alert('An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
