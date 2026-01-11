import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// GET - Get all tracked bills for the current user
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'member') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get tracked bills with bill details
    const { data: trackedBills, error } = await supabase
      .from('tracked_bills')
      .select(`
        id,
        tracked_at,
        notes,
        bills (
          id,
          bill_number,
          title,
          short_title,
          description,
          status,
          chamber,
          session,
          introduced_date,
          last_action,
          last_action_date,
          primary_sponsor_id,
          bill_type,
          url
        )
      `)
      .eq('member_id', user.id)
      .order('tracked_at', { ascending: false });

    if (error) {
      console.error('Error fetching tracked bills:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tracked_bills: trackedBills || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Track a bill
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'member') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bill_id, notes } = body;

    if (!bill_id) {
      return NextResponse.json(
        { error: 'bill_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if already tracking
    const { data: existing } = await supabase
      .from('tracked_bills')
      .select('id')
      .eq('member_id', user.id)
      .eq('bill_id', bill_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Bill is already being tracked' },
        { status: 400 }
      );
    }

    // Add to tracked bills
    const { data, error } = await supabase
      .from('tracked_bills')
      .insert({
        member_id: user.id,
        bill_id,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking bill:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Bill tracked successfully',
      tracked_bill: data,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Untrack a bill
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'member') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('bill_id');

    if (!billId) {
      return NextResponse.json(
        { error: 'bill_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Remove from tracked bills
    const { error } = await supabase
      .from('tracked_bills')
      .delete()
      .eq('member_id', user.id)
      .eq('bill_id', parseInt(billId));

    if (error) {
      console.error('Error untracking bill:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Bill untracked successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
