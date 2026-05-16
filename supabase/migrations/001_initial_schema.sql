-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  public_slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members table (links users to orgs)
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Processing Activities (ROPA)
CREATE TABLE processing_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  data_categories TEXT[], -- Array of data category strings
  data_subjects TEXT[], -- Array of data subject types
  third_parties TEXT[], -- Array of third party recipients
  retention_period TEXT,
  security_measures TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAIA Manuals
CREATE TABLE paia_manuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  registration_number TEXT,
  industry TEXT,
  information_officer_name TEXT NOT NULL,
  information_officer_email TEXT NOT NULL,
  information_officer_phone TEXT,
  business_address TEXT,
  record_categories TEXT[],
  data_subject_categories TEXT[],
  personal_info_categories TEXT[],
  third_party_recipients TEXT[],
  cross_border_transfers TEXT,
  security_safeguards TEXT,
  request_process TEXT,
  contact_details TEXT,
  generated_markdown TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DSAR Requests
CREATE TABLE dsar_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  request_type TEXT NOT NULL, -- 'access', 'deletion', 'correction', 'objection'
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'
  response_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Documents
CREATE TABLE compliance_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'policy', 'procedure', 'agreement', 'other'
  file_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID, -- References auth.users, nullable for system events
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'processing_activity', 'paia_manual', 'dsar_request', etc.
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_processing_activities_org_id ON processing_activities(org_id);
CREATE INDEX idx_paia_manuals_org_id ON paia_manuals(org_id);
CREATE INDEX idx_dsar_requests_org_id ON dsar_requests(org_id);
CREATE INDEX idx_compliance_documents_org_id ON compliance_documents(org_id);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_organizations_public_slug ON organizations(public_slug);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE paia_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsar_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they are members of"
  ON organizations FOR SELECT
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert organizations" -- Only through signup flow
  ON organizations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for org_members
CREATE POLICY "Users can view their own org memberships"
  ON org_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert org memberships" -- Only through signup flow
  ON org_members FOR INSERT
  WITH CHECK (true);

-- RLS Policies for processing_activities
CREATE POLICY "Users can view processing activities in their org"
  ON processing_activities FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert processing activities in their org"
  ON processing_activities FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update processing activities in their org"
  ON processing_activities FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete processing activities in their org"
  ON processing_activities FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- RLS Policies for paia_manuals
CREATE POLICY "Users can view PAIA manuals in their org"
  ON paia_manuals FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert PAIA manuals in their org"
  ON paia_manuals FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update PAIA manuals in their org"
  ON paia_manuals FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete PAIA manuals in their org"
  ON paia_manuals FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- RLS Policies for dsar_requests
CREATE POLICY "Users can view DSAR requests in their org"
  ON dsar_requests FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert DSAR requests in their org"
  ON dsar_requests FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update DSAR requests in their org"
  ON dsar_requests FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete DSAR requests in their org"
  ON dsar_requests FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- RLS Policies for compliance_documents
CREATE POLICY "Users can view compliance documents in their org"
  ON compliance_documents FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert compliance documents in their org"
  ON compliance_documents FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update compliance documents in their org"
  ON compliance_documents FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete compliance documents in their org"
  ON compliance_documents FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- RLS Policies for audit_logs
CREATE POLICY "Users can view audit logs in their org"
  ON audit_logs FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert audit logs in their org"
  ON audit_logs FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Function to handle organization lookup by public_slug (for public DSAR intake)
CREATE OR REPLACE FUNCTION get_org_by_slug(slug TEXT)
RETURNS UUID AS $$
  SELECT id FROM organizations WHERE public_slug = slug LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;
