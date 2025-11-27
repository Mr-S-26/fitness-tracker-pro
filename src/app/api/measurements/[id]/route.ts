// src/app/api/measurements/[id]/route.ts
// FIXED FOR NEXT.JS 15/16 - params must be awaited

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // FIXED: await params before accessing .id
    const { id: measurementId } = await params;

    // Verify measurement belongs to user
    const { data: existingMeasurement } = await supabase
      .from('body_measurements')
      .select('user_id')
      .eq('id', measurementId)
      .single();

    if (!existingMeasurement || existingMeasurement.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update measurement
    const { data: measurement, error } = await supabase
      .from('body_measurements')
      .update(body)
      .eq('id', measurementId)
      .select()
      .single();

    if (error) {
      console.error('Error updating measurement:', error);
      return NextResponse.json(
        { error: 'Failed to update measurement' },
        { status: 500 }
      );
    }

    return NextResponse.json(measurement);
  } catch (error) {
    console.error('Error in PUT /api/measurements/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // FIXED: await params before accessing .id
    const { id: measurementId } = await params;

    // Verify measurement belongs to user
    const { data: existingMeasurement } = await supabase
      .from('body_measurements')
      .select('user_id')
      .eq('id', measurementId)
      .single();

    if (!existingMeasurement || existingMeasurement.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete measurement
    const { error } = await supabase
      .from('body_measurements')
      .delete()
      .eq('id', measurementId);

    if (error) {
      console.error('Error deleting measurement:', error);
      return NextResponse.json(
        { error: 'Failed to delete measurement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/measurements/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}