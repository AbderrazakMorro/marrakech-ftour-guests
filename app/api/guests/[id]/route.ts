import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession(request);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = params.id;
        const body = await request.json();
        const { first_name, last_name, email, phone, verified } = body;

        const supabase = createClient();

        const { data: guest, error } = await supabase
            .from('guests')
            .update({
                first_name,
                last_name,
                email,
                phone,
                verified,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update Guest Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ guest });
    } catch (error) {
        console.error('PATCH /api/guests/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to update guest' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession(request);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = params.id;
        const supabase = createClient();

        const { error } = await supabase
            .from('guests')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete Guest Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/guests/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to delete guest' },
            { status: 500 }
        );
    }
}
