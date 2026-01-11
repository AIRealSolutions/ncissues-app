import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find member by email
    const { data: member, error: findError } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !member) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account has been set up (has password)
    if (!member.password_hash) {
      return NextResponse.json(
        { error: 'Account not set up. Please complete registration first.' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, member.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = generateToken({
      id: member.id,
      email: member.email,
      role: member.role || 'member',
      type: 'member',
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Update last login
    await supabase
      .from('members')
      .update({ last_login: new Date().toISOString() })
      .eq('id', member.id);

    // Don't return password hash
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
