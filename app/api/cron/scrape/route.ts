import { NextResponse } from 'next/server';
import { runDailyScrape } from '@/lib/ncleg-scraper';

/**
 * GET /api/cron/scrape
 *
 * Automated daily scrape triggered by Vercel CRON (see vercel.json).
 * Protected by CRON_SECRET environment variable.
 *
 * Vercel sets the Authorization header to Bearer <CRON_SECRET>
 * when invoking CRON jobs.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runDailyScrape();

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
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Daily CRON scrape failed:', err);
    return NextResponse.json(
      {
        error: 'Scrape failed',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
