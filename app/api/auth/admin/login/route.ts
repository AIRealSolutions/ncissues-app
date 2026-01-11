import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find admin user
    const { data: admin, error: findError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (findError || !admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    // Generate token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    });

    // Set cookie
    await setAuthCookie(token);

    // Return admin data (without password)
    const { password_hash, ...adminData } = admin;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: adminData,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
