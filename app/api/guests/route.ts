import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/client';
import { generateQRCode } from '@/lib/qr/generator';
import { sendInvitationEmail } from '@/lib/email/mailer';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'verified' | 'not_verified' | null
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    let query = supabase
      .from('guests')
      .select('*', { count: 'exact' });

    // Apply filter
    if (filter === 'verified') {
      query = query.eq('verified', true);
    } else if (filter === 'not_verified') {
      query = query.eq('verified', false);
    }

    // Apply search
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Pagination and Ordering
    // Note: 'created_at' does not exist in schema, using 'first_name' for stable ordering
    query = query
      .order('first_name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      guests: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('GET /api/guests unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { first_name, last_name, email, phone } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Generate QR code token
    const qrCodeToken = await generateQRCode({ email, first_name, last_name });

    // Generate QR code image for email
    const { generateQRCodeImage } = await import('@/lib/qr/generator');
    const qrCodeImage = await generateQRCodeImage(qrCodeToken, email, `${first_name} ${last_name}`);

    // Insert guest - Schema compliant
    const { data: guest, error } = await supabase
      .from('guests')
      .insert({
        first_name,
        last_name,
        email,
        phone: phone || null,
        qr_code: qrCodeToken,
        verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send invitation email
    try {
      await sendInvitationEmail({
        email,
        firstName: first_name,
        lastName: last_name,
        qrCode: qrCodeImage,
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    return NextResponse.json({ guest });
  } catch (error) {
    console.error('POST /api/guests error:', error);
    return NextResponse.json(
      { error: 'Failed to create guest' },
      { status: 500 }
    );
  }
}
