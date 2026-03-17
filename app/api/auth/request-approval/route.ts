import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Simple in-memory rate limiter — max 3 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { message: 'Trop de demandes. Réessayez dans une heure.' },
        { status: 429 }
      );
    }

    const { email, firstName, lastName, grade, password } = await request.json();

    if (!email || !firstName || !lastName || !grade || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { message: `Your request is already ${existing.status}. Please wait for admin approval.` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('approval_requests')
      .insert({ email, first_name: firstName, last_name: lastName, grade, password, status: 'pending' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Approval request submitted. Please wait for admin review.',
      request: { id: data.id, email: data.email, status: data.status },
    });
  } catch (error) {
    console.error('[request-approval] Error:', error);
    return NextResponse.json({ message: 'An error occurred during approval request' }, { status: 500 });
  }
}