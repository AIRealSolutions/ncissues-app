import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

// GET - List members with filtering and pagination
export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search');
  const party = searchParams.get('party');
  const district = searchParams.get('district');

  const supabase = await createClient();

  try {
    let query = supabase
      .from('members')
      .select('*', { count: 'exact' })
      .order('last_name', { ascending: true });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,voter_reg_num.ilike.%${search}%`);
    }

    if (party) {
      query = query.eq('party_cd', party);
    }

    if (district) {
      query = query.or(`nc_senate_dist.eq.${district},nc_house_dist.eq.${district}`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      members: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
