import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Verify the requester is admin/owner
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

    // Make sure target isn't an owner
    const { data: targetProfile } = await adminSupabase
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .single();

    if (targetProfile?.role === 'owner') {
      return NextResponse.json({ message: 'Cannot kick an owner' }, { status: 403 });
    }

    // Admins cannot kick other admins
    if (callerProfile.role === 'admin' && targetProfile?.role === 'admin') {
      return NextResponse.json({ message: 'Admins cannot kick other admins' }, { status: 403 });
    }

    // Set approval back to pending so they can't log in
    await adminSupabase
      .from('approval_requests')
      .update({ status: 'pending' })
      .eq('email', targetProfile?.email);

    // Force sign out all sessions
    await adminSupabase.auth.admin.signOut(userId, 'global');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Kick error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
