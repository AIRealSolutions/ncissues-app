/**
 * NC General Assembly Scraper
 *
 * Uses the official webservices.ncleg.gov REST API (no API key required)
 * and RSS feeds from ncleg.gov.
 *
 * Working endpoints discovered:
 *   - AllActiveCommittees/{session}/true → JSON (field names: sCommitteeName, nCommitteeID, sChamberCode)
 *   - AllBills/{session}                 → JSON [{chamber, billNumber}, ...]
 *   - BillHistory/{session}/{billId}/RSS → RSS (one feed per bill)
 *   - ncleg.gov/LegislativeCalendar/RSS  → RSS (upcoming calendar events)
 *   - ncleg.gov/News/RSS                 → RSS (general news)
 */

import { createClient } from '@/lib/supabase/server';

const NCLEG_API_BASE = 'https://webservices.ncleg.gov';
const NCLEG_WWW = 'https://www.ncleg.gov';
const SESSION_YEAR = process.env.NCLEG_SESSION_YEAR || '2025';

// ─── Types from ncleg webservices API ──────────────────────────────────────

/** Actual field names returned by AllActiveCommittees */
interface NclegCommitteeRaw {
  nCommitteeID: number;
  sCommitteeName: string;
  sCommitteeNameWithChamber: string;
  sChamberCode: string;   // 'H', 'S', 'N' (nonpartisan/joint)
  sSessionCode: string;
  bNonStandingCommittee: boolean;
  bJointSelectCommittee: boolean;
}

/** Actual field names returned by AllBills */
interface NclegBillRef {
  chamber: string;        // 'H' or 'S'
  billNumber: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Normalize chamber string for our DB */
function normalizeChamber(chamber: string | null | undefined): 'house' | 'senate' | null {
  if (!chamber) return null;
  const c = chamber.toLowerCase();
  if (c === 'h' || c.includes('house')) return 'house';
  if (c === 's' || c.includes('senate')) return 'senate';
  return null;
}

/** Build bill ID string like "H10" or "S200" */
function billId(chamber: string, num: number): string {
  return `${chamber.toUpperCase()}${num}`;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ncissues-app/1.0 (contact@ncissues.com)',
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchXml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
        'User-Agent': 'ncissues-app/1.0 (contact@ncissues.com)',
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Extract text content between XML tags */
function xmlTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return null;
  return (m[1] ?? m[2] ?? '').trim() || null;
}

/** Parse all <item> blocks from an RSS feed */
function rssItems(xml: string): Array<{ title: string; pubDate: string | null; guid: string }> {
  const items: Array<{ title: string; pubDate: string | null; guid: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    items.push({
      title: xmlTag(block, 'title') ?? '',
      pubDate: xmlTag(block, 'pubDate'),
      guid: xmlTag(block, 'guid') ?? '',
    });
  }
  return items;
}

// ─── Log helper ───────────────────────────────────────────────────────────

export async function logScrapeRun(
  source: string,
  status: 'success' | 'error' | 'partial',
  recordsProcessed: number,
  message: string
) {
  const supabase = await createClient();
  await supabase.from('scraping_logs').insert({
    source,
    status,
    records_processed: recordsProcessed,
    message,
  });
}

// ─── Scrapers ─────────────────────────────────────────────────────────────

/**
 * Fetch upcoming legislative calendar events from RSS and upsert into
 * the `legislative_events` table.
 */
export async function scrapeCalendar(): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  const xml = await fetchXml(`${NCLEG_WWW}/LegislativeCalendar/RSS`);
  if (!xml) {
    return { count: 0, errors: ['Failed to fetch legislative calendar RSS'] };
  }

  const supabase = await createClient();
  const items = rssItems(xml);

  for (const item of items) {
    // title: "Committee Name" or "Floor Session"
    // description: "Start time: MM/DD/YYYY HH:MM:SS AM<br>Calendar: House <br>Location: 544 LOB"
    const descMatch = xml.match(new RegExp(
      `<guid[^>]*>${item.guid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/guid>[\\s\\S]*?<description>([\\s\\S]*?)<\\/description>`
    ));
    const desc = descMatch ? descMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<br\s*\/?>/gi, ' | ') : '';

    const locationMatch = desc.match(/Location:\s*([^|]+)/i);
    const calendarMatch = desc.match(/Calendar:\s*(House|Senate)/i);

    const eventDate = item.pubDate
      ? new Date(item.pubDate).toISOString().split('T')[0]
      : null;
    if (!eventDate) continue;

    const startTime = item.pubDate
      ? new Date(item.pubDate).toTimeString().slice(0, 5)
      : null;

    const { error } = await supabase.from('legislative_events').upsert(
      {
        event_date: eventDate,
        start_time: startTime,
        chamber: normalizeChamber(calendarMatch?.[1] ?? null),
        event_type: 'committee_meeting',
        description: item.title,
        location: locationMatch?.[1]?.trim() ?? null,
        is_public: true,
        source_url: `${NCLEG_WWW}/LegislativeCalendar`,
      },
      { onConflict: 'event_date,description,chamber' }
    );

    if (error) {
      errors.push(`Calendar upsert error: ${error.message}`);
    } else {
      count++;
    }
  }

  return { count, errors };
}

/**
 * Fetch one bill's data from its RSS history feed.
 * Returns { title, lastAction, lastActionDate, filedDate } or null.
 */
async function fetchBillFromRss(id: string): Promise<{
  title: string;
  lastAction: string | null;
  lastActionDate: string | null;
  filedDate: string | null;
} | null> {
  const xml = await fetchXml(`${NCLEG_API_BASE}/BillHistory/${SESSION_YEAR}/${id}/RSS`);
  if (!xml) return null;

  // Channel title: "House Bill 10 - Some Bill Title. (2025-2026)"
  const channelTitle = xmlTag(xml, 'title');
  if (!channelTitle) return null;

  // Strip session suffix "(2025-2026)" and extract title after " - "
  const dashIdx = channelTitle.indexOf(' - ');
  const title = dashIdx >= 0
    ? channelTitle.slice(dashIdx + 3).replace(/\s*\(\d{4}-\d{4}\)\s*$/, '').trim()
    : channelTitle.replace(/\s*\(\d{4}-\d{4}\)\s*$/, '').trim();

  const items = rssItems(xml);
  if (items.length === 0) return { title, lastAction: null, lastActionDate: null, filedDate: null };

  const filedItem = items[0];
  const lastItem = items[items.length - 1];

  const toDate = (pubDate: string | null) =>
    pubDate ? new Date(pubDate).toISOString().split('T')[0] : null;

  return {
    title,
    lastAction: lastItem.title,
    lastActionDate: toDate(lastItem.pubDate),
    filedDate: toDate(filedItem.pubDate),
  };
}

/**
 * Sync all bills for the session using AllBills + per-bill RSS feeds.
 * For a full rebuild this calls each bill's RSS individually.
 * Calls onProgress(done, total) after each bill.
 */
export async function scrapeAllBills(
  onProgress?: (done: number, total: number) => void
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  const allBills = await fetchJson<NclegBillRef[]>(
    `${NCLEG_API_BASE}/AllBills/${SESSION_YEAR}`
  );

  if (!allBills || allBills.length === 0) {
    return { count: 0, errors: ['Failed to fetch bill list from AllBills endpoint'] };
  }

  const supabase = await createClient();
  const total = allBills.length;

  for (let i = 0; i < allBills.length; i++) {
    const ref = allBills[i];
    const id = billId(ref.chamber, ref.billNumber);

    const billData = await fetchBillFromRss(id);
    if (!billData) {
      errors.push(`Failed to fetch RSS for ${id}`);
      onProgress?.(i + 1, total);
      continue;
    }

    const chamber = normalizeChamber(ref.chamber);
    const { error } = await supabase.from('bills').upsert(
      {
        bill_number: id,
        title: billData.title,
        chamber,
        status: billData.lastAction ?? 'Filed',
        introduced_date: billData.filedDate,
        last_action: billData.lastAction,
        last_action_date: billData.lastActionDate,
        ncleg_url: `${NCLEG_WWW}/BillLookUp/${SESSION_YEAR}/${id}`,
      },
      { onConflict: 'bill_number' }
    );

    if (error) {
      errors.push(`Bill upsert error for ${id}: ${error.message}`);
    } else {
      count++;
    }

    onProgress?.(i + 1, total);
  }

  return { count, errors };
}

/**
 * Fetch all active committees and upsert into the `committees` table.
 * Uses actual API field names: sCommitteeName, nCommitteeID, sChamberCode.
 */
export async function scrapeCommittees(): Promise<{ count: number; errors: string[] }> {
  const supabase = await createClient();
  const errors: string[] = [];
  let count = 0;

  const committees = await fetchJson<NclegCommitteeRaw[]>(
    `${NCLEG_API_BASE}/AllActiveCommittees/${SESSION_YEAR}/true`
  );

  if (!committees) {
    return { count: 0, errors: ['Failed to fetch active committees'] };
  }

  for (const c of committees) {
    const name = c.sCommitteeName;
    if (!name) continue;

    // sChamberCode: 'H', 'S', or 'N' (joint/nonpartisan)
    const chamber = normalizeChamber(c.sChamberCode);
    const committeeType = c.bJointSelectCommittee
      ? 'joint_select'
      : c.bNonStandingCommittee
      ? 'select'
      : 'standing';

    const { error } = await supabase.from('committees').upsert(
      {
        name,
        chamber,
        committee_type: committeeType,
        is_active: true,
      },
      { onConflict: 'name,chamber' }
    );

    if (error) {
      errors.push(`Committee upsert error for ${name}: ${error.message}`);
    } else {
      count++;
    }
  }

  return { count, errors };
}

// ─── Full sync exports ─────────────────────────────────────────────────────

export interface ScrapeResult {
  calendar: { count: number; errors: string[] };
  bills: { count: number; errors: string[] };
  committees: { count: number; errors: string[] };
  totalRecords: number;
  allErrors: string[];
}

export async function runDailyScrape(): Promise<ScrapeResult> {
  const [calendar, committees] = await Promise.all([
    scrapeCalendar(),
    scrapeCommittees(),
  ]);

  // For daily: only sync bills that exist; full rebuild handled separately
  const bills = { count: 0, errors: [] as string[] };

  const totalRecords = calendar.count + bills.count + committees.count;
  const allErrors = [...calendar.errors, ...bills.errors, ...committees.errors];
  const status = allErrors.length === 0 ? 'success' : totalRecords > 0 ? 'partial' : 'error';

  await logScrapeRun('ncleg_daily_scrape', status, totalRecords, allErrors.join('; ') || 'OK');

  return { calendar, bills, committees, totalRecords, allErrors };
}
