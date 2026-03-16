import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_ORIGINS = ['https://rebookswap.vercel.app', 'http://localhost:3000'];

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { bookId, offeredBookIds } = await request.json();

    if (!bookId || !offeredBookIds || !Array.isArray(offeredBookIds) || offeredBookIds.length === 0) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    // Verify the target book exists and is available
    const { data: targetBook, error: bookError } = await supabase
      .from('books')
      .select('id, title, user_id, is_available')
      .eq('id', bookId)
      .single();

    if (bookError || !targetBook) {
      return NextResponse.json({ message: 'Livre introuvable' }, { status: 404 });
    }

    if (!targetBook.is_available) {
      return NextResponse.json({ message: 'Ce livre n\'est plus disponible' }, { status: 400 });
    }

    if (targetBook.user_id === user.id) {
      return NextResponse.json({ message: 'Vous ne pouvez pas échanger votre propre livre' }, { status: 400 });
    }

    // Verify ALL offered books actually belong to the requester and are available
    const { data: offeredBooks, error: offeredError } = await supabase
      .from('books')
      .select('id, title, user_id, is_available')
      .in('id', offeredBookIds);

    if (offeredError || !offeredBooks || offeredBooks.length !== offeredBookIds.length) {
      return NextResponse.json({ message: 'Livres proposés introuvables' }, { status: 400 });
    }

    for (const book of offeredBooks) {
      if (book.user_id !== user.id) {
        return NextResponse.json({ message: 'Vous ne pouvez proposer que vos propres livres' }, { status: 403 });
      }
      if (!book.is_available) {
        return NextResponse.json({ message: `"${book.title}" n'est plus disponible` }, { status: 400 });
      }
    }

    // Check no existing pending offer from this user for this book
    const { data: existingOffer } = await supabase
      .from('swap_offers')
      .select('id')
      .eq('book_id', bookId)
      .eq('requester_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingOffer) {
      return NextResponse.json({ message: 'Vous avez déjà une demande en attente pour ce livre' }, { status: 400 });
    }

    // Get real name from profiles table — not user_metadata which can be spoofed
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();

    const requesterName = profile
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : user.email?.split('@')[0] || 'Utilisateur';

    const offeredBookTitles = offeredBooks.map(b => b.title);

    const { error: insertError } = await supabase.from('swap_offers').insert([{
      book_id: bookId,
      book_owner_id: targetBook.user_id,
      requester_id: user.id,
      requester_name: requesterName,
      requester_email: profile?.email || user.email,
      requested_book_title: targetBook.title,
      offered_books: offeredBookTitles,
      offered_book_ids: offeredBookIds,
      status: 'pending',
    }]);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Swap create error:', error);
    return NextResponse.json({ message: 'Une erreur est survenue' }, { status: 500 });
  }
}