import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST - Register public user (name + phone only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, phone_number, email } = body;

    if (!full_name || !phone_number) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone_number)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if phone number already exists in public_users
    const { data: existingPublic } = await supabase
      .from('public_users')
      .select('*')
      .eq('phone_number', phone_number)
      .single();

    if (existingPublic) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      );
    }

    // Check if phone number exists in members
    const { data: existingMember } = await supabase
      .from('members')
      .select('*')
      .eq('phone_number', phone_number)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'Phone number already registered as a member' },
        { status: 409 }
      );
    }

    // Create public user
    const { data: user, error } = await supabase
      .from('public_users')
      .insert({
        full_name,
        phone_number,
        email: email || null,
        last_login: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating public user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create session token
    const token = sign(
      {
        id: user.id,
        type: 'public',
        full_name: user.full_name,
        phone_number: user.phone_number,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Public account created successfully',
      user: {
        id: user.id,
        type: 'public',
        full_name: user.full_name,
        phone_number: user.phone_number,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
