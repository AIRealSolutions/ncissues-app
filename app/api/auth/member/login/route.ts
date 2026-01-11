import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { voter_reg_num, ncid, password } = body;

    if ((!voter_reg_num && !ncid) || !password) {
      return NextResponse.json(
        { error: 'Voter registration number/NC ID and password are required' },
        { status: 400 }
      );
    }

    // Find member
    let query = supabase.from('members').select('*');
    if (voter_reg_num) {
      query = query.eq('voter_reg_num', voter_reg_num);
    } else {
      query = query.eq('ncid', ncid);
    }

    const { data: member, error: findError } = await query.single();

    if (findError || !member) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if password is set
    if (!member.password_hash) {
      return NextResponse.json(
        { error: 'No password set. Please set a password first.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, member.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from('members')
      .update({ last_login: new Date().toISOString() })
      .eq('id', member.id);

    // Generate token
    const token = generateToken({
      id: member.id,
      email: member.email || member.voter_reg_num,
      role: member.role || 'member',
      type: 'member',
    });

    // Set cookie
    await setAuthCookie(token);

    // Return member data (without password)
    const { password_hash, ...memberData } = member;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      member: memberData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
