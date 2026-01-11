import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Fetch full user data
    if (user.type === 'admin') {
      const { data: admin } = await supabase
        .from('admin_users')
        .select('id, username, email, full_name, role, last_login')
        .eq('id', user.id)
        .single();

      return NextResponse.json({
        ...user,
        ...admin,
      });
    } else {
      const { data: member } = await supabase
        .from('members')
        .select('id, voter_reg_num, ncid, first_name, last_name, full_name, email, phone, party_cd, nc_senate_dist, nc_house_dist, role')
        .eq('id', user.id)
        .single();

      return NextResponse.json({
        ...user,
        ...member,
      });
    }
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
