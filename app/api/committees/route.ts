import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chamber = searchParams.get('chamber');
  const committeeType = searchParams.get('type');
  const search = searchParams.get('search');

  const supabase = await createClient();

  try {
    let query = supabase
      .from('committees')
      .select('*')
      .eq('is_active', true)
      .order('chamber', { ascending: true })
      .order('name', { ascending: true });

    if (chamber) {
      query = query.eq('chamber', chamber);
    }

    if (committeeType) {
      query = query.eq('committee_type', committeeType);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching committees:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
