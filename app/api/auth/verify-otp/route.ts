import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();
    console.log('verify-otp received - email:', email, 'token:', token);

    if (!email || !token) {
      return NextResponse.json({ message: 'Champs manquants' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('otp', token)
      .single();

    if (error || !data) {
      console.log('OTP not found:', error);
      return NextResponse.json({ message: 'Code invalide ou expiré' }, { status: 400 });
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ message: 'Code expiré, veuillez en demander un nouveau' }, { status: 400 });
    }

    await supabaseAdmin.from('email_otps').delete().eq('email', email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ message: 'Une erreur est survenue' }, { status: 500 });
  }
}