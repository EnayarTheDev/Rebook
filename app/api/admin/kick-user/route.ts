import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = ['https://rebookswap.vercel.app', 'http://localhost:3000'];

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await request.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!callerProfile || !['admin', 'owner'].includes(callerProfile.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: targetProfile } = await adminSupabase.from('profiles').select('role, email').eq('id', userId).single();
    if (targetProfile?.role === 'owner') {
      return NextResponse.json({ message: 'Cannot kick an owner' }, { status: 403 });
    }
    if (callerProfile.role === 'admin' && targetProfile?.role === 'admin') {
      return NextResponse.json({ message: 'Admins cannot kick other admins' }, { status: 403 });
    }

    await adminSupabase.from('approval_requests').update({ status: 'pending' }).eq('email', targetProfile?.email);
    await adminSupabase.auth.admin.signOut(userId, 'global');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Kick error:', error);
    return NextResponse.json({ message: 'Une erreur est survenue' }, { status: 500 });
  }
}