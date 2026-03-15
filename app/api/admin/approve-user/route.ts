import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { approvalId } = await request.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'owner'].includes(profile.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: approval, error: fetchError } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('id', approvalId)
      .single();

    if (fetchError || !approval) {
      return NextResponse.json({ message: 'Approval request not found' }, { status: 404 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: createdUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email: approval.email,
      password: approval.password,
      email_confirm: true,
      user_metadata: {
        first_name: approval.first_name,
        last_name: approval.last_name,
        role: 'user',
      },
    });

    if (createError && !createError.message.includes('already been registered')) {
      throw createError;
    }

    let userId = createdUser?.user?.id;

    if (!userId) {
      const { data: { users } } = await adminSupabase.auth.admin.listUsers();
      const existingUser = users.find((u: any) => u.email === approval.email);
      userId = existingUser?.id;
    }

    if (userId) {
      await adminSupabase
        .from('profiles')
        .upsert({
          id: userId,
          email: approval.email,
          first_name: approval.first_name,
          last_name: approval.last_name,
          role: 'user',
          is_banned: false,
        }, { onConflict: 'id' });
    }

    await supabase
      .from('approval_requests')
      .update({ status: 'approved' })
      .eq('id', approvalId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Approve error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}