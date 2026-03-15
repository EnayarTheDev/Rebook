import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ message: 'Email requis' }, { status: 400 });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin
      .from('email_otps')
      .upsert({ email, otp, expires_at: expiresAt }, { onConflict: 'email' });

    if (error) {
      console.error('DB error:', error);
      throw error;
    }

    const { error: emailError } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Votre code de vérification Re:Book',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fdfbf7;border:2px solid #2d2d2d;border-radius:8px;">
          <h2 style="font-size:1.5rem;margin-bottom:8px;">Vérification de votre email</h2>
          <p style="color:#444;margin-bottom:24px;">Voici votre code de vérification pour Re:Book. Il expire dans 10 minutes.</p>
          <div style="font-size:2.5rem;font-weight:bold;letter-spacing:0.4em;text-align:center;padding:24px;background:#fff;border:2px solid #2d2d2d;border-radius:8px;margin-bottom:24px;">
            ${otp}
          </div>
          <p style="color:#888;font-size:0.9rem;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          <p style="margin-top:32px;color:#aaa;font-size:0.85rem;">Re:Book — Echangez vos livres gratuitement</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      throw emailError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ message: "Erreur lors de l'envoi du code" }, { status: 500 });
  }
}