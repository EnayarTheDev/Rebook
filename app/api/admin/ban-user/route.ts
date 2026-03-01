import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId, isBanned } = await request.json();

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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Use service role to bypass RLS
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Make sure target isn't an owner
    const { data: targetProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (targetProfile?.role === 'owner') {
      return NextResponse.json({ message: 'Cannot ban an owner' }, { status: 403 });
    }

    const { error } = await adminSupabase
      .from('profiles')
      .update({ is_banned: isBanned })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ban user error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
