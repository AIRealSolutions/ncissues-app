import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    // Get total members
    const { count: totalMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    // Get members with email
    const { count: membersWithEmail } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null);

    // Get members with password
    const { count: membersWithPassword } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .not('password_hash', 'is', null);

    // Get party breakdown
    const { data: partyData } = await supabase
      .from('members')
      .select('party_cd')
      .not('party_cd', 'is', null);

    const partyBreakdown: Record<string, number> = {};
    partyData?.forEach((row) => {
      partyBreakdown[row.party_cd] = (partyBreakdown[row.party_cd] || 0) + 1;
    });

    // Get district breakdown
    const { data: districtData } = await supabase
      .from('members')
      .select('nc_senate_dist, nc_house_dist');

    const senateDistricts = new Set();
    const houseDistricts = new Set();
    districtData?.forEach((row) => {
      if (row.nc_senate_dist) senateDistricts.add(row.nc_senate_dist);
      if (row.nc_house_dist) houseDistricts.add(row.nc_house_dist);
    });

    return NextResponse.json({
      totalMembers: totalMembers || 0,
      membersWithEmail: membersWithEmail || 0,
      membersWithPassword: membersWithPassword || 0,
      partyBreakdown,
      senateDistricts: senateDistricts.size,
      houseDistricts: houseDistricts.size,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
