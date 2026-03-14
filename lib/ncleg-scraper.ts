/**
 * NC General Assembly Scraper
 *
 * Uses the official webservices.ncleg.gov REST API (no API key required)
 * to pull legislative data into Supabase.
 *
 * API base: https://webservices.ncleg.gov/
 */

import { createClient } from '@/lib/supabase/server';

const NCLEG_API_BASE = 'https://webservices.ncleg.gov';
const SESSION_YEAR = process.env.NCLEG_SESSION_YEAR || '2025';

// ─── Types from ncleg webservices API ──────────────────────────────────────

interface NclegBillOnCalendar {
  BillId: string;
  BillTitle: string;
  Chamber: string;
  PrimeSponsor: string;
  CalendarDate: string;
  CalendarTime: string | null;
  CalendarLocation: string | null;
  CommitteeName: string | null;
}

interface NclegFiledBill {
  BillId: string;
  BillTitle: string;
  Chamber: string;
  PrimeSponsor: string;
  FiledDate: string;
  AbstractText: string | null;
}

interface NclegBillAction {
  BillId: string;
  BillTitle: string;
  Chamber: string;
  ActionDate: string;
  ActionText: string;
  ActionChamber: string | null;
}

interface NclegCommittee {
  CommitteeId: string;
  CommitteeName: string;
  Chamber: string;
  CommitteeType: string | null;
  IsStanding: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Format a Date as MM-DD-YYYY for ncleg webservices */
function formatDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

/** Normalize bill number from ncleg format, e.g. "H 123" → "H123" */
function normalizeBillNumber(billId: string): string {
  return billId.replace(/\s+/g, '').toUpperCase();
}

/** Determine chamber string for our DB from ncleg chamber value */
function normalizeChamber(chamber: string | null | undefined): 'house' | 'senate' | null {
  if (!chamber) return null;
  const c = chamber.toLowerCase();
  if (c.includes('house') || c === 'h') return 'house';
  if (c.includes('senate') || c === 's') return 'senate';
  return null;
}

async function fetchNcleg<T>(path: string): Promise<T[] | null> {
  const url = `${NCLEG_API_BASE}/${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ncissues-app/1.0 (contact@ncissues.com)',
      },
      next: { revalidate: 0 }, // always fresh
    });

    if (!res.ok) {
      console.warn(`ncleg API ${url} returned ${res.status}`);
      return null;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      // Some endpoints return XML or empty — handle gracefully
      return null;
    }

    return (await res.json()) as T[];
  } catch (err) {
    console.error(`ncleg fetch error for ${url}:`, err);
    return null;
  }
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
 * Fetch bills scheduled on the legislative calendar for a given date and
 * upsert them into the `legislative_events` table.
 */
export async function scrapeCalendar(date: Date): Promise<{ count: number; errors: string[] }> {
  const dateStr = formatDate(date);
  const chambers: Array<'H' | 'S'> = ['H', 'S'];
  const supabase = await createClient();
  const errors: string[] = [];
  let count = 0;

  for (const chamber of chambers) {
    const bills = await fetchNcleg<NclegBillOnCalendar>(
      `BillsOnCalendar/${SESSION_YEAR}/${chamber}/${dateStr}`
    );

    if (!bills) {
      errors.push(`Failed to fetch ${chamber} calendar for ${dateStr}`);
      continue;
    }

    for (const bill of bills) {
      const eventDate = bill.CalendarDate
        ? new Date(bill.CalendarDate).toISOString().split('T')[0]
        : date.toISOString().split('T')[0];

      const { error } = await supabase.from('legislative_events').upsert(
        {
          event_date: eventDate,
          start_time: bill.CalendarTime || null,
          chamber: normalizeChamber(bill.Chamber),
          event_type: bill.CommitteeName ? 'committee_meeting' : 'floor_session',
          description: `${normalizeBillNumber(bill.BillId)}: ${bill.BillTitle}`,
          location: bill.CalendarLocation || null,
          is_public: true,
          source_url: `https://www.ncleg.gov/BillLookUp/${SESSION_YEAR}/${normalizeBillNumber(bill.BillId)}`,
        },
        { onConflict: 'event_date,description,chamber' }
      );

      if (error) {
        errors.push(`Calendar upsert error: ${error.message}`);
      } else {
        count++;
      }
    }
  }

  return { count, errors };
}

/**
 * Fetch bills filed today and upsert into the `bills` table.
 */
export async function scrapeFiledBills(date: Date): Promise<{ count: number; errors: string[] }> {
  const dateStr = formatDate(date);
  const chambers: Array<'H' | 'S'> = ['H', 'S'];
  const supabase = await createClient();
  const errors: string[] = [];
  let count = 0;

  for (const chamber of chambers) {
    const bills = await fetchNcleg<NclegFiledBill>(
      `FiledBills/${SESSION_YEAR}/${chamber}/${dateStr}`
    );

    if (!bills) {
      errors.push(`Failed to fetch ${chamber} filed bills for ${dateStr}`);
      continue;
    }

    for (const bill of bills) {
      const billNumber = normalizeBillNumber(bill.BillId);
      const chamberNorm = normalizeChamber(bill.Chamber);

      const { error } = await supabase.from('bills').upsert(
        {
          bill_number: billNumber,
          title: bill.BillTitle,
          chamber: chamberNorm,
          status: 'Filed',
          primary_sponsor: bill.PrimeSponsor || null,
          summary: bill.AbstractText || null,
          introduced_date: bill.FiledDate
            ? new Date(bill.FiledDate).toISOString().split('T')[0]
            : null,
          last_action: 'Filed',
          last_action_date: bill.FiledDate
            ? new Date(bill.FiledDate).toISOString().split('T')[0]
            : null,
          ncleg_url: `https://www.ncleg.gov/BillLookUp/${SESSION_YEAR}/${billNumber}`,
        },
        { onConflict: 'bill_number' }
      );

      if (error) {
        errors.push(`Bill upsert error for ${billNumber}: ${error.message}`);
      } else {
        count++;
      }
    }
  }

  return { count, errors };
}

/**
 * Fetch bill actions within a date range and update `bill_history`
 * plus `bills.last_action` for affected bills.
 */
export async function scrapeBillActions(
  startDate: Date,
  endDate: Date
): Promise<{ count: number; errors: string[] }> {
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  const chambers: Array<'H' | 'S'> = ['H', 'S'];
  const supabase = await createClient();
  const errors: string[] = [];
  let count = 0;

  for (const chamber of chambers) {
    const actions = await fetchNcleg<NclegBillAction>(
      `BillActionsInDateRange/${SESSION_YEAR}/${chamber}/${startStr}/${endStr}`
    );

    if (!actions) {
      errors.push(`Failed to fetch ${chamber} bill actions for ${startStr}–${endStr}`);
      continue;
    }

    for (const action of actions) {
      const billNumber = normalizeBillNumber(action.BillId);

      // Look up the bill in our DB
      const { data: bill } = await supabase
        .from('bills')
        .select('id, last_action_date')
        .eq('bill_number', billNumber)
        .single();

      if (!bill) continue; // Skip if we don't have this bill

      const actionDate = action.ActionDate
        ? new Date(action.ActionDate).toISOString().split('T')[0]
        : null;

      // Insert action into bill_history (ignore duplicate conflicts)
      const { error: histError } = await supabase.from('bill_history').upsert(
        {
          bill_id: bill.id,
          action_date: actionDate,
          action: action.ActionText,
          chamber: normalizeChamber(action.ActionChamber || action.Chamber),
        },
        { onConflict: 'bill_id,action_date,action' }
      );

      if (histError) {
        errors.push(`bill_history insert error for ${billNumber}: ${histError.message}`);
        continue;
      }

      // Update bills.last_action if this is newer
      if (!bill.last_action_date || (actionDate && actionDate >= bill.last_action_date)) {
        await supabase
          .from('bills')
          .update({ last_action: action.ActionText, last_action_date: actionDate })
          .eq('id', bill.id);
      }

      count++;
    }
  }

  return { count, errors };
}

/**
 * Fetch all active committees and upsert into the `committees` table.
 */
export async function scrapeCommittees(): Promise<{ count: number; errors: string[] }> {
  const supabase = await createClient();
  const errors: string[] = [];
  let count = 0;

  const committees = await fetchNcleg<NclegCommittee>(
    `AllActiveCommittees/${SESSION_YEAR}/true`
  );

  if (!committees) {
    return { count: 0, errors: ['Failed to fetch active committees'] };
  }

  for (const committee of committees) {
    const { error } = await supabase.from('committees').upsert(
      {
        name: committee.CommitteeName,
        chamber: normalizeChamber(committee.Chamber),
        committee_type: committee.CommitteeType || (committee.IsStanding ? 'standing' : 'select'),
        is_active: true,
      },
      { onConflict: 'name,chamber' }
    );

    if (error) {
      errors.push(`Committee upsert error for ${committee.CommitteeName}: ${error.message}`);
    } else {
      count++;
    }
  }

  return { count, errors };
}

// ─── Full daily scrape ─────────────────────────────────────────────────────

export interface ScrapeResult {
  calendar: { count: number; errors: string[] };
  filedBills: { count: number; errors: string[] };
  billActions: { count: number; errors: string[] };
  committees: { count: number; errors: string[] };
  totalRecords: number;
  allErrors: string[];
}

/**
 * Run a full daily scrape for the given date (defaults to today).
 * Logs the result to `scraping_logs`.
 */
export async function runDailyScrape(date: Date = new Date()): Promise<ScrapeResult> {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);

  const [calendar, filedBills, billActions, committees] = await Promise.all([
    scrapeCalendar(date),
    scrapeFiledBills(date),
    scrapeBillActions(yesterday, date),
    scrapeCommittees(),
  ]);

  const totalRecords =
    calendar.count + filedBills.count + billActions.count + committees.count;

  const allErrors = [
    ...calendar.errors,
    ...filedBills.errors,
    ...billActions.errors,
    ...committees.errors,
  ];

  const status = allErrors.length === 0 ? 'success' : totalRecords > 0 ? 'partial' : 'error';

  await logScrapeRun(
    'ncleg_daily_scrape',
    status,
    totalRecords,
    allErrors.length > 0
      ? `Processed ${totalRecords} records with ${allErrors.length} errors: ${allErrors.slice(0, 3).join('; ')}`
      : `Successfully processed ${totalRecords} records for ${formatDate(date)}`
  );

  return { calendar, filedBills, billActions, committees, totalRecords, allErrors };
}
