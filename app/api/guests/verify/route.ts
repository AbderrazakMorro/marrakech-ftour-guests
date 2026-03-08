import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { verifyQRToken } from '@/lib/qr/generator';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCode } = body;

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code is required' },
        { status: 400 }
      );
    }

    // Verify QR token and extract the hash
    const qrToken = verifyQRToken(qrCode);
    if (!qrToken) {
      return NextResponse.json(
        { error: 'Invalid QR code' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Find guest by QR code token (hash)
    const { data: guest, error: fetchError } = await supabase
      .from('guests')
      .select('*')
      .eq('qr_code', qrToken)
      .single();

    if (fetchError || !guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (guest.verified) {
      return NextResponse.json(
        {
          error: 'Guest already verified',
          guest: {
            id: guest.id,
            first_name: guest.first_name,
            last_name: guest.last_name,
            verified: true,
          },
        },
        { status: 400 }
      );
    }

    // Mark as verified
    const { data: updatedGuest, error: updateError } = await supabase
      .from('guests')
      .update({ verified: true })
      .eq('id', guest.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      guest: {
        id: updatedGuest.id,
        first_name: updatedGuest.first_name,
        last_name: updatedGuest.last_name,
        verified: updatedGuest.verified,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify guest' },
      { status: 500 }
    );
  }
}

