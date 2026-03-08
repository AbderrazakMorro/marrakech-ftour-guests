import { NextRequest, NextResponse } from 'next/server';
import { generateQRCodeImage } from '@/lib/qr/generator';
import { createClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Find guest by QR code token
    const { data: guest, error } = await supabase
      .from('guests')
      .select('*')
      .eq('qr_code', token)
      .single();

    if (error || !guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Generate QR code image
    const qrImage = await generateQRCodeImage(
      token,
      guest.email,
      `${guest.first_name} ${guest.last_name}`
    );

    // Return as image - using Buffer in Node.js runtime
    const base64Data = qrImage.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

