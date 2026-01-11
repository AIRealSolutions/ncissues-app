import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const eventType = searchParams.get('event_type');
  const chamber = searchParams.get('chamber');
  const committeeId = searchParams.get('committee_id');

  const supabase = await createClient();

  try {
    let query = supabase
      .from('legislative_events')
      .select(`
        *,
        committees:committee_id (
          id,
          name,
          chamber
        )
      `)
      .eq('is_public', true)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (startDate) {
      query = query.gte('event_date', startDate);
    }

    if (endDate) {
      query = query.lte('event_date', endDate);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (chamber) {
      query = query.eq('chamber', chamber);
    }

    if (committeeId) {
      query = query.eq('committee_id', parseInt(committeeId));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching calendar events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new event (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // TODO: Add admin authentication check

    const { data: event, error } = await supabase
      .from('legislative_events')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
