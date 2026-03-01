import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, grade } = await request.json();

    if (!email || !password || !firstName || !lastName || !grade) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if email is approved
    const { data: approvalRequest } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('email', email)
      .eq('status', 'approved')
      .single();

    if (!approvalRequest) {
      return NextResponse.json(
        { message: 'Your email has not been approved yet' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, grade, role: 'user' },
      },
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        firstName,
        lastName,
      },
    });
  } catch (error) {
    console.error('[v0] Signup error:', error);
    return NextResponse.json(
      { message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
