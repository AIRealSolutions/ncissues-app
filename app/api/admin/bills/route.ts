import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// GET - List all bills (admin only)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const { data: bills, error, count } = await supabase
      .from('bills')
      .select('*', { count: 'exact' })
      .order('last_action_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      bills: bills || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new bill (admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      bill_number,
      title,
      chamber,
      status,
      topic,
      summary,
      full_text,
      introduced_date,
      primary_sponsor,
      cosponsors,
      ncleg_url,
      last_action,
      last_action_date,
      keywords,
    } = body;

    // Validation
    if (!bill_number || !title || !chamber) {
      return NextResponse.json(
        { error: 'bill_number, title, and chamber are required' },
        { status: 400 }
      );
    }

    if (chamber !== 'house' && chamber !== 'senate') {
      return NextResponse.json(
        { error: 'chamber must be "house" or "senate"' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if bill already exists
    const { data: existing } = await supabase
      .from('bills')
      .select('id')
      .eq('bill_number', bill_number)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Bill with this number already exists' },
        { status: 409 }
      );
    }

    const newBill = {
      bill_number,
      title,
      chamber,
      status: status || 'Filed',
      topic: topic || null,
      summary: summary || null,
      full_text: full_text || null,
      introduced_date: introduced_date || null,
      primary_sponsor: primary_sponsor || null,
      cosponsors: cosponsors || null,
      ncleg_url: ncleg_url || `https://www.ncleg.gov/BillLookUp/2025/${bill_number}`,
      last_action: last_action || null,
      last_action_date: last_action_date || introduced_date || null,
      keywords: keywords || null,
    };

    const { data: bill, error } = await supabase
      .from('bills')
      .insert(newBill)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('scraping_logs').insert({
      source: 'manual_entry',
      status: 'success',
      records_processed: 1,
      message: `Bill ${bill_number} added by admin ${user.id}`,
    });

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update an existing bill (admin only)
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: bill, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('scraping_logs').insert({
      source: 'manual_update',
      status: 'success',
      records_processed: 1,
      message: `Bill ${bill.bill_number} updated by admin ${user.id}`,
    });

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a bill (admin only)
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
