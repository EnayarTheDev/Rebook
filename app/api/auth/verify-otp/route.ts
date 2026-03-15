import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();
    if (!email || !token) return NextResponse.json({ message: 'Champs manquants' }, { status: 400 });

    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      console.error('Verify OTP error details:', error);
      return NextResponse.json({ message: 'Code invalide ou expiré' }, { status: 400 });
    }

    // Sign out immediately — we only used this to verify the email, not to log them in
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ message: 'Une erreur est survenue' }, { status: 500 });
  }
}