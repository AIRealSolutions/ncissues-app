import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get bill with primary sponsor
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select(`
        *,
        legislators!bills_primary_sponsor_id_fkey (
          id,
          full_name,
          party,
          district,
          chamber
        )
      `)
      .eq('id', id)
      .single();

    if (billError || !bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    // Get bill sponsors (co-sponsors)
    const { data: sponsors } = await supabase
      .from('bill_sponsors')
      .select(`
        sponsor_type,
        legislators (
          id,
          full_name,
          party,
          district,
          chamber
        )
      `)
      .eq('bill_id', id);

    // Get bill history/actions
    const { data: history } = await supabase
      .from('bill_history')
      .select('*')
      .eq('bill_id', id)
      .order('action_date', { ascending: false });

    // Get votes
    const { data: votes } = await supabase
      .from('votes')
      .select('*')
      .eq('bill_id', id)
      .order('vote_date', { ascending: false });

    // Get individual vote records if available
    const voteIds = votes?.map(v => v.id) || [];
    let voteRecords = [];
    
    if (voteIds.length > 0) {
      const { data: records } = await supabase
        .from('vote_records')
        .select(`
          vote_id,
          vote_cast,
          legislators (
            id,
            full_name,
            party,
            district,
            chamber
          )
        `)
        .in('vote_id', voteIds);
      
      voteRecords = records || [];
    }

    // Get bill text/versions
    const { data: versions } = await supabase
      .from('bill_versions')
      .select('*')
      .eq('bill_id', id)
      .order('version_date', { ascending: false });

    return NextResponse.json({
      bill,
      primary_sponsor: bill.legislators || null,
      sponsors: sponsors || [],
      history: history || [],
      votes: votes || [],
      vote_records: voteRecords || [],
      versions: versions || [],
    });
  } catch (error) {
    console.error('Error fetching bill details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
