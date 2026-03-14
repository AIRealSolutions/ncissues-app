/**
 * Data synchronization service.
 * Fetches legislator and committee data from ncleg.gov and stores it in the database.
 */

import { fetchMemberTable, fetchCommittees, type NclegCommittee, type ParsedMemberTableRow } from "./ncleg";
import { upsertLegislator, upsertCommittee, getLegislatorCount } from "./db";

// ============================================================================
// Sync Legislators
// ============================================================================

export async function syncLegislators(): Promise<{ synced: number; errors: number }> {
  let synced = 0;
  let errors = 0;

  try {
    console.log("[Sync] Starting legislator sync...");

    // Fetch from both chambers
    const [houseMembers, senateMembers] = await Promise.all([
      fetchMemberTable("H"),
      fetchMemberTable("S"),
    ]);

    const allMembers = [...houseMembers, ...senateMembers];
    console.log(`[Sync] Found ${allMembers.length} legislators (${houseMembers.length} House, ${senateMembers.length} Senate)`);

    for (const member of allMembers) {
      try {
        // Check if member has resigned/died (indicated in their name on ncleg.gov)
        const isActive = !member.name.includes("Resigned") && !member.name.includes("Died");
        // Clean the name (remove parenthetical notes)
        const cleanName = member.name.replace(/\s*\(.*?\)\s*/g, "").trim();

        await upsertLegislator({
          memberId: member.memberId,
          chamber: member.chamber,
          district: member.district,
          name: cleanName,
          party: member.party,
          counties: member.counties,
          isActive,
          photoUrl: `https://www.ncleg.gov/Members/MemberImage/${member.memberId.replace(/^[HS]-/, "")}/Low`,
        });
        synced++;
      } catch (error) {
        console.error(`[Sync] Error syncing legislator ${member.name}:`, error);
        errors++;
      }
    }

    console.log(`[Sync] Legislator sync complete: ${synced} synced, ${errors} errors`);
  } catch (error) {
    console.error("[Sync] Fatal error during legislator sync:", error);
  }

  return { synced, errors };
}

// ============================================================================
// Sync Committees
// ============================================================================

export async function syncCommittees(year: number = 2025): Promise<{ synced: number; errors: number }> {
  let synced = 0;
  let errors = 0;

  try {
    console.log("[Sync] Starting committee sync...");

    const committeeData = await fetchCommittees(year);
    console.log(`[Sync] Found ${committeeData.length} committees`);

    for (const comm of committeeData) {
      try {
        await upsertCommittee({
          committeeId: comm.nCommitteeID,
          chamberCode: comm.sChamberCode,
          sessionCode: comm.sSessionCode || null,
          name: comm.sCommitteeName,
          nameWithChamber: comm.sCommitteeNameWithChamber,
          docSiteId: comm.nDocSiteID,
          isSelectCommittee: comm.bSelectCommittee,
          isNonStanding: comm.bNonStandingCommittee,
          isJointSelect: comm.bJointSelectCommittee,
        });
        synced++;
      } catch (error) {
        console.error(`[Sync] Error syncing committee ${comm.sCommitteeName}:`, error);
        errors++;
      }
    }

    console.log(`[Sync] Committee sync complete: ${synced} synced, ${errors} errors`);
  } catch (error) {
    console.error("[Sync] Fatal error during committee sync:", error);
  }

  return { synced, errors };
}

// ============================================================================
// Initial Data Load
// ============================================================================

/**
 * Check if data needs to be loaded and perform initial sync if needed.
 * Called on server startup.
 */
export async function ensureDataLoaded(): Promise<void> {
  try {
    const count = await getLegislatorCount();
    if (count === 0) {
      console.log("[Sync] No legislators in database, performing initial sync...");
      await syncLegislators();
      await syncCommittees();
    } else {
      console.log(`[Sync] Found ${count} legislators in database, skipping initial sync.`);
    }
  } catch (error) {
    console.error("[Sync] Error checking data:", error);
  }
}
