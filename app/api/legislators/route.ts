import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  // page sends 'House' or 'Senate' — table stores lowercase
  const chamberParam = searchParams.get('chamber');
  const chamber = chamberParam ? chamberParam.toLowerCase() : null;
  const search = searchParams.get('search');

  const supabase = await createClient();

  try {
    let query = supabase
      .from('legislators')
      .select('id, name, party, chamber, district, email, phone, photo_url, office_address, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (district) {
      query = query.eq('district', district);
    }

    if (chamber) {
      query = query.eq('chamber', chamber);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
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
