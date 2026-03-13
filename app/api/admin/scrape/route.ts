import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  scrapeCalendar,
  scrapeFiledBills,
  scrapeBillActions,
  scrapeCommittees,
  runDailyScrape,
  logScrapeRun,
} from '@/lib/ncleg-scraper';

/**
 * POST /api/admin/scrape
 *
 * Manually trigger an ncleg.gov data scrape. Admin only.
 *
 * Query params:
 *   type  = calendar | bills | actions | committees | all  (default: all)
 *   date  = YYYY-MM-DD  (default: today)
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.type !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const dateParam = searchParams.get('date');

  const date = dateParam ? new Date(dateParam) : new Date();

  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
  }

  try {
    if (type === 'all') {
      const result = await runDailyScrape(date);
      return NextResponse.json({
        success: result.allErrors.length === 0,
        totalRecords: result.totalRecords,
        breakdown: {
          calendar: result.calendar.count,
          filedBills: result.filedBills.count,
          billActions: result.billActions.count,
          committees: result.committees.count,
        },
        errors: result.allErrors,
      });
    }

    if (type === 'calendar') {
      const result = await scrapeCalendar(date);
      await logScrapeRun(
        'ncleg_calendar_manual',
        result.errors.length === 0 ? 'success' : 'partial',
        result.count,
        `Manual calendar scrape: ${result.count} events`
      );
      return NextResponse.json({ success: true, count: result.count, errors: result.errors });
    }

    if (type === 'bills') {
      const result = await scrapeFiledBills(date);
      await logScrapeRun(
        'ncleg_bills_manual',
        result.errors.length === 0 ? 'success' : 'partial',
        result.count,
        `Manual filed bills scrape: ${result.count} bills`
      );
      return NextResponse.json({ success: true, count: result.count, errors: result.errors });
    }

    if (type === 'actions') {
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const result = await scrapeBillActions(yesterday, date);
      await logScrapeRun(
        'ncleg_actions_manual',
        result.errors.length === 0 ? 'success' : 'partial',
        result.count,
        `Manual bill actions scrape: ${result.count} actions`
      );
      return NextResponse.json({ success: true, count: result.count, errors: result.errors });
    }

    if (type === 'committees') {
      const result = await scrapeCommittees();
      await logScrapeRun(
        'ncleg_committees_manual',
        result.errors.length === 0 ? 'success' : 'partial',
        result.count,
        `Manual committees scrape: ${result.count} committees`
      );
      return NextResponse.json({ success: true, count: result.count, errors: result.errors });
    }

    return NextResponse.json(
      { error: 'Invalid type. Use: all | calendar | bills | actions | committees' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Scrape error:', err);
    await logScrapeRun(
      `ncleg_${type}_manual`,
      'error',
      0,
      `Unhandled error: ${err instanceof Error ? err.message : String(err)}`
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
