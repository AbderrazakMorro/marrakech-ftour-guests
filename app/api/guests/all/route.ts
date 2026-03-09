import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Minimal endpoint to fetch all guests for client-side caching in the scanner.
 * Return only essential fields to keep payload small.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();

        // Fetch only needed fields for matching and display
        const { data: guests, error } = await supabase
            .from('guests')
            .select('id, first_name, last_name, qr_code, verified')
            .order('first_name', { ascending: true });

        if (error) {
            console.error('Supabase fetch all guests error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ guests: guests || [] });
    } catch (error) {
        console.error('Unexpected error in /api/guests/all:', error);
        return NextResponse.json(
            { error: 'Failed to fetch guest list' },
            { status: 500 }
        );
    }
}
