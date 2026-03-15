import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { data: approval } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('id', approvalId)
      .single();

    if (!approval) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    await supabase
      .from('approval_requests')
      .update({ status: 'rejected' })
      .eq('id', approvalId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reject user error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}