-- 1. HARDENING: Remove loose public access policies
-- These were initially for simplicity but aren't needed since we use service role for signup and public API
DROP POLICY IF EXISTS "Users can insert organizations" ON organizations;
DROP POLICY IF EXISTS "Users can insert org memberships" ON org_members;
DROP POLICY IF EXISTS "Allow public and authenticated to insert DSAR requests" ON dsar_requests;

-- Replace with explicit authenticated-only insert for DSAR (if we ever use it directly)
-- Actually, we'll just stick to the service role for now. 
-- But let's add a safe authenticated policy just in case.
CREATE POLICY "Authenticated users can insert DSAR requests for their own org"
  ON dsar_requests FOR INSERT
  TO authenticated
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- 2. STORAGE: Set up compliance documents bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('compliance-documents', 'compliance-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Note: We store files in paths like: <org_id>/<file_name>
-- This allows us to enforce tenant-level isolation in storage.

CREATE POLICY "Users can view documents from their organization"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'compliance-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT org_id::text FROM public.org_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents to their organization"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'compliance-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT org_id::text FROM public.org_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents from their organization"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'compliance-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT org_id::text FROM public.org_members WHERE user_id = auth.uid()
  )
);

-- 3. HARDENING: Refine compliance_documents table RLS
-- (Already exists but let's ensure it's tight)
-- No changes needed as 001 already has org-scoped policies.
