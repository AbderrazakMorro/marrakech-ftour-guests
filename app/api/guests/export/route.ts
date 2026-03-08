import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/client';
import { generateCSV } from '@/lib/csv/parser';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const { data: guests, error } = await supabase
      .from('guests')
      .select('*')
      .order('first_name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const csvData = (guests || []).map((guest) => ({
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone: guest.phone || '',
      verified: guest.verified ? 'Yes' : 'No',
      qr_code: guest.qr_code || '',
    }));

    const csv = generateCSV(csvData);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="guests.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export guests' },
      { status: 500 }
    );
  }
}

