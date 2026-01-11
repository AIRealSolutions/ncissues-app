import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const chamber = searchParams.get('chamber');
  const search = searchParams.get('search');

  const supabase = await createClient();

  try {
    let query = supabase
      .from('legislators')
      .select('*')
      .eq('is_active', true)
      .order('last_name', { ascending: true });

    if (district) {
      query = query.eq('district', parseInt(district));
    }

    if (chamber) {
      query = query.eq('chamber', chamber);
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching legislators:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
