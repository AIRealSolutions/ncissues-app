import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// GET - Find member by voter registration number or NCID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const voterRegNum = searchParams.get('voter_reg_num');
  const ncid = searchParams.get('ncid');
  const email = searchParams.get('email');

  if (!voterRegNum && !ncid && !email) {
    return NextResponse.json(
      { error: 'voter_reg_num, ncid, or email is required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    let query = supabase.from('members').select('*');

    if (voterRegNum) {
      query = query.eq('voter_reg_num', voterRegNum);
    } else if (ncid) {
      query = query.eq('ncid', ncid);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      console.error('Error fetching member:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Don't return password hash
    const { password_hash, ...memberData } = data;

    return NextResponse.json(memberData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Update member information (email, phone, password)
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { voter_reg_num, ncid, email, phone, password } = body;

    // Must provide either voter_reg_num or ncid to identify member
    if (!voter_reg_num && !ncid) {
      return NextResponse.json(
        { error: 'voter_reg_num or ncid is required' },
        { status: 400 }
      );
    }

    // Find the member
    let query = supabase.from('members').select('id');
    if (voter_reg_num) {
      query = query.eq('voter_reg_num', voter_reg_num);
    } else {
      query = query.eq('ncid', ncid);
    }

    const { data: member, error: findError } = await query.single();

    if (findError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Build update object
    const updates: any = {
      account_updated_at: new Date().toISOString(),
    };

    if (email) {
      updates.email = email;
      updates.email_verified = false; // Reset verification when email changes
    }

    if (phone) {
      updates.phone = phone;
      updates.phone_verified = false; // Reset verification when phone changes
    }

    if (password) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      updates.password_hash = await bcrypt.hash(password, salt);
    }

    // Update the member
    const { data: updated, error: updateError } = await supabase
      .from('members')
      .update(updates)
      .eq('id', member.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating member:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Don't return password hash
    const { password_hash, ...memberData } = updated;

    return NextResponse.json({
      success: true,
      message: 'Member information updated successfully',
      member: memberData,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
