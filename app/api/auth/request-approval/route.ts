import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('verify-otp received body:', JSON.stringify(body));

    const { email, token } = body;
    if (!email || !token) {
      console.log('Missing fields - email:', email, 'token:', token);
      return NextResponse.json({ message: 'Champs manquants' }, { status: 400 });
    }

    const supabase = await createClient();

    const types = ['email', 'magiclink', 'signup', 'recovery'] as const;
    let lastError = null;

    for (const type of types) {
      const { error } = await supabase.auth.verifyOtp({ email, token, type });
      if (!error) {
        await supabase.auth.signOut();
        return NextResponse.json({ success: true });
      }
      lastError = error;
      console.log(`Type ${type} failed:`, error.message);
    }

    console.error('All OTP types failed:', lastError);
    return NextResponse.json({ message: 'Code invalide ou expiré' }, { status: 400 });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ message: 'Une erreur est survenue' }, { status: 500 });
  }
}