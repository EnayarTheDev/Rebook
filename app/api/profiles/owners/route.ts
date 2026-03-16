import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Always fetch show_email flag
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, show_email')
      .in('id', userIds);

    if (error) throw error;

    // Only expose email if:
    // 1. The requester is authenticated
    // 2. The profile owner has opted in to show their email
    const sanitized = (profiles || []).map(p => ({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      email: (user && p.show_email) ? p.email : null,
      show_email: p.show_email,
    }));

    return NextResponse.json({ profiles: sanitized });
  } catch (error: any) {
    console.error('Owners fetch error:', error);
    return NextResponse.json({ message: 'Une erreur est survenue' }, { status: 500 });
  }
}