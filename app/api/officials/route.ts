import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const officeType = searchParams.get('office_type');
  const county = searchParams.get('county');
  const district = searchParams.get('district');
  const search = searchParams.get('search');

  const supabase = await createClient();

  try {
    let query = supabase
      .from('elected_officials')
      .select('*')
      .eq('is_active', true)
      .order('office_type', { ascending: true })
      .order('last_name', { ascending: true });

    if (officeType) {
      query = query.eq('office_type', officeType);
    }

    if (county) {
      query = query.eq('county', county);
    }

    if (district) {
      query = query.or(`district.eq.${district}`);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,office_title.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching officials:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
