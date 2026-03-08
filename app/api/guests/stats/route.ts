import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();

        // Querying only existing columns
        const { data: guests, error } = await supabase
            .from('guests')
            .select('verified');

        if (error) {
            console.error('Stats API Query Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const total = guests.length;
        const verified = guests.filter(g => g.verified).length;
        const pending = total - verified;

        return NextResponse.json({
            total,
            verified,
            pending
        });
    } catch (error) {
        console.error('Stats API unexpected error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
