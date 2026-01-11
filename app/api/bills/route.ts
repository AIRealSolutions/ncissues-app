import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const chamber = searchParams.get('chamber');
  const topic = searchParams.get('topic');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const supabase = await createClient();

  let query = supabase
    .from('bills')
    .select('*')
    .order('introduced_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (chamber) {
    query = query.eq('chamber', chamber);
  }

  if (topic) {
    query = query.eq('topic', topic);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,bill_number.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
