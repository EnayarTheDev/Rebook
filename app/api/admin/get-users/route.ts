import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!callerProfile || !['admin', 'owner'].includes(callerProfile.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all profiles except self
    const { data: profiles, error } = await adminSupabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, is_banned, created_at')
      .neq('id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch approval statuses to detect revoked users
    const emails = (profiles || []).map((p: any) => p.email);
    const { data: approvals } = await adminSupabase
      .from('approval_requests')
      .select('email, status')
      .in('email', emails);

    const approvalMap: Record<string, string> = {};
    approvals?.forEach((a: any) => { approvalMap[a.email] = a.status; });

    const users = (profiles || []).map((p: any) => ({
      ...p,
      is_banned: p.is_banned ?? false,
      is_revoked: approvalMap[p.email] === 'pending',
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
