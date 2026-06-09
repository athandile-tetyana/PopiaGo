import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Missing file path' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify the user belongs to the organization that owns this file path
  // The path starts with the org_id: <org_id>/<filename>
  const pathOrgId = path.split('/')[0];
  
  const { data: orgMember, error: orgError } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .eq('org_id', pathOrgId)
    .single();

  if (orgError || !orgMember) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Use service client to generate a signed URL (since bucket is private)
  const serviceSupabase = createServiceClient();
  const { data, error: signedUrlError } = await serviceSupabase.storage
    .from('compliance-documents')
    .createSignedUrl(path, 300); // 5 minutes expiry

  if (signedUrlError || !data?.signedUrl) {
    console.error('Signed URL error:', signedUrlError);
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
