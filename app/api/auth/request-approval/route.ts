import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, grade } = await request.json();

    if (!email || !firstName || !lastName || !grade) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if already requested
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

    // Create approval request
    const { data, error } = await supabase
      .from('approval_requests')
      .insert({ email, first_name: firstName, last_name: lastName, grade, status: 'pending' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Approval request submitted. Please wait for admin review.',
      request: data,
    });
  } catch (error) {
    console.error('[v0] Approval request error:', error);
    return NextResponse.json(
      { message: 'An error occurred during approval request' },
      { status: 500 }
    );
  }
}
