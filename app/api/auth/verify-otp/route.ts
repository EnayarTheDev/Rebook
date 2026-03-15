import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();
    if (!email || !token) return NextResponse.json({ message: 'Champs manquants' }, { status: 400 });

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('otp', token)
      .single();

    if (error || !data) {
      return NextResponse.json({ message: 'Code invalide ou expiré' }, { status: 400 });
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ message: 'Code expiré, veuillez en demander un nouveau' }, { status: 400 });
    }

    // Delete OTP after successful verification
    await supabase.from('email_otps').delete().eq('email', email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ message: 'Une erreur est survenue' }, { status: 500 });
  }
}