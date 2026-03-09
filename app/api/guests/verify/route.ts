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

    // 1. Attempt to mark as verified in one go (where qr_code matches and not yet verified)
    const { data: updatedGuest, error: updateError } = await supabase
      .from('guests')
      .update({ verified: true })
      .eq('qr_code', qrToken)
      .eq('verified', false)
      .select()
      .single();

    if (updatedGuest) {
      return NextResponse.json({
        success: true,
        guest: {
          id: updatedGuest.id,
          first_name: updatedGuest.first_name,
          last_name: updatedGuest.last_name,
          verified: updatedGuest.verified,
        },
      });
    }

    // 2. If no rows were updated, find out why (invalid token or already verified)
    const { data: guest, error: fetchError } = await supabase
      .from('guests')
      .select('*')
      .eq('qr_code', qrToken)
      .single();

    if (fetchError || !guest) {
      return NextResponse.json(
        { error: 'Invité non trouvé ou code QR invalide' },
        { status: 404 }
      );
    }

    if (guest.verified) {
      return NextResponse.json(
        {
          error: 'Cet invité est déjà vérifié',
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

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la vérification' },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify guest' },
      { status: 500 }
    );
  }
}

