/**
 * NC General Assembly data service.
 * Fetches legislator, committee, and bill data from official ncleg.gov webservices.
 */

const NCLEG_WEBSERVICES_BASE = "https://webservices.ncleg.gov";
const NCLEG_BASE = "https://www.ncleg.gov";

// ============================================================================
// Types
// ============================================================================

export interface NclegCommittee {
  nCommitteeID: number;
  sChamberCode: string;
  sSessionCode: string;
  sCommitteeName: string;
  sCommitteeNameWithChamber: string;
  nDocSiteID: number | null;
  bSelectCommittee: boolean;
  bNonStandingCommittee: boolean;
  bJointSelectCommittee: boolean;
}

export interface NclegBillRef {
  chamber: string;
  billNumber: number;
}

export interface ParsedMemberTableRow {
  party: string;
  district: number;
  name: string;
  memberId: string;
  counties: string;
  chamber: "H" | "S";
}

// ============================================================================
// Fetch functions
// ============================================================================

/**
 * Fetch all active committees for a given session year.
 */
export async function fetchCommittees(year: number = 2025): Promise<NclegCommittee[]> {
  const url = `${NCLEG_WEBSERVICES_BASE}/AllActiveCommittees/${year}/true`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch committees: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all bills for a given year.
 */
export async function fetchAllBills(year: number = 2025): Promise<NclegBillRef[]> {
  const url = `${NCLEG_WEBSERVICES_BASE}/AllBills/${year}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch bills: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Parse the member table HTML from ncleg.gov to extract legislator data.
 * The ncleg.gov member table has 6 columns:
 *   0: Party (plain text, e.g. "R" or "D")
 *   1: District sort key (hidden numeric)
 *   2: District number (link to district map)
 *   3: Last name sort key (hidden text)
 *   4: Full name (link to biography)
 *   5: Counties represented (links)
 */
export async function fetchMemberTable(chamber: "H" | "S"): Promise<ParsedMemberTableRow[]> {
  const url = `${NCLEG_BASE}/Members/MemberTable/${chamber}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch member table: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  return parseMemberTableHtml(html, chamber);
}

// ============================================================================
// HTML Parsers
// ============================================================================

function parseMemberTableHtml(html: string, chamber: "H" | "S"): ParsedMemberTableRow[] {
  const members: ParsedMemberTableRow[] = [];

  // Extract the tbody content
  const tbodyStart = html.indexOf("<tbody>");
  const tbodyEnd = html.indexOf("</tbody>");
  if (tbodyStart < 0 || tbodyEnd < 0) {
    console.warn("[ncleg] No tbody found in member table HTML");
    return members;
  }

  const tbody = html.substring(tbodyStart, tbodyEnd + 8);

  // Parse each row
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(tbody)) !== null) {
    const row = rowMatch[1];

    // Extract all <td> cells
    const cells: string[] = [];
    const cellRegex = /<td>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(row)) !== null) {
      cells.push(cellMatch[1]);
    }

    if (cells.length < 6) continue;

    // Cell 0: Party
    const party = cells[0].trim();

    // Cell 2: District number (contains a link like <a href="/Redistricting/...">77</a>)
    const districtMatch = cells[2].match(/>(\d+)</);
    const district = districtMatch ? parseInt(districtMatch[1], 10) : 0;

    // Cell 4: Member name and biography link
    // Format: <a href="/Members/Biography/H/53">Julia C. Howard</a>
    const nameMatch = cells[4].match(/Biography\/([^"]+)"[^>]*>([^<]+)/);
    let memberId = "";
    let name = "";
    if (nameMatch) {
      memberId = nameMatch[1]; // e.g. "H/53"
      name = nameMatch[2].trim();
    }

    // Cell 5: Counties (contains links and &nbsp; separators)
    const counties = cells[5]
      .replace(/<[^>]+>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, "") // Remove &nbsp;
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/,\s*,/g, ",") // Remove double commas
      .replace(/^\s*,\s*/, "") // Remove leading comma
      .replace(/\s*,\s*$/, "") // Remove trailing comma
      .trim();

    if (district > 0 && name) {
      members.push({
        party,
        district,
        name,
        memberId: `${chamber}-${memberId.replace(`${chamber}/`, "")}`,
        counties,
        chamber,
      });
    }
  }

  return members;
}

/**
 * Fetch full legislator data by combining member table from both chambers.
 */
export async function fetchAllLegislators(): Promise<ParsedMemberTableRow[]> {
  const [houseMembers, senateMembers] = await Promise.all([
    fetchMemberTable("H"),
    fetchMemberTable("S"),
  ]);

  return [...houseMembers, ...senateMembers];
}
