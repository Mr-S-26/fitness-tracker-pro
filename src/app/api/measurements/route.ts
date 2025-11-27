import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: measurements, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('measured_at', { ascending: false });

    if (error) {
      console.error('Error fetching measurements:', error);
      return NextResponse.json(
        { error: 'Failed to fetch measurements' },
        { status: 500 }
      );
    }

    return NextResponse.json(measurements);
  } catch (error) {
    console.error('Error in GET /api/measurements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate that user_id matches authenticated user
    if (body.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Insert measurement
    const { data: measurement, error } = await supabase
      .from('body_measurements')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Error creating measurement:', error);
      return NextResponse.json(
        { error: 'Failed to create measurement' },
        { status: 500 }
      );
    }

    return NextResponse.json(measurement, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/measurements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}