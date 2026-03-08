import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/client';
import { parseCSV } from '@/lib/csv/parser';
import { generateQRCode } from '@/lib/qr/generator';
import { sendInvitationEmail } from '@/lib/email/mailer';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    const guests = parseCSV(csvContent);

    if (guests.length === 0) {
      return NextResponse.json(
        { error: 'No valid guests found in CSV' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const createdGuests = [];
    const errors = [];

    for (const guestData of guests) {
      try {
        // Generate QR code token
        const qrCodeToken = await generateQRCode({
          email: guestData.email,
          first_name: guestData.first_name,
          last_name: guestData.last_name,
        });
        
        // Generate QR code image for email
        const { generateQRCodeImage } = await import('@/lib/qr/generator');
        const qrCodeImage = await generateQRCodeImage(
          qrCodeToken,
          guestData.email,
          `${guestData.first_name} ${guestData.last_name}`
        );

        // Insert guest
        const { data: guest, error } = await supabase
          .from('guests')
          .insert({
            first_name: guestData.first_name,
            last_name: guestData.last_name,
            email: guestData.email,
            phone: guestData.phone || null,
            qr_code: qrCodeToken,
            verified: false,
          })
          .select()
          .single();

        if (error) {
          errors.push({ email: guestData.email, error: error.message });
          continue;
        }

        createdGuests.push(guest);

        // Send invitation email
        try {
          await sendInvitationEmail({
            email: guestData.email,
            firstName: guestData.first_name,
            lastName: guestData.last_name,
            qrCode: qrCodeImage,
          });
        } catch (emailError) {
          console.error(`Failed to send email to ${guestData.email}:`, emailError);
        }
      } catch (error) {
        errors.push({
          email: guestData.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      created: createdGuests.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to import guests' },
      { status: 500 }
    );
  }
}

