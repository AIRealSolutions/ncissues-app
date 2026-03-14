import {
  scrapeCalendar,
  scrapeAllBills,
  scrapeCommittees,
  logScrapeRun,
} from '@/lib/ncleg-scraper';

export const maxDuration = 300;

export type ScrapeEvent =
  | { type: 'step'; step: string; status: 'running' | 'done' | 'error'; message: string; count?: number; errors?: string[] }
  | { type: 'log'; message: string }
  | { type: 'complete'; total: number; errors: number };

/**
 * POST /api/admin/scrape
 * Body: { mode: 'daily' | 'full' }
 * Returns: text/event-stream (SSE) with ScrapeEvent JSON objects
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mode: 'daily' | 'full' = body.mode ?? 'daily';
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: ScrapeEvent) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)); } catch {}
      };

      let total = 0;
      let errors = 0;

      try {
        // Step 1 — Committees
        emit({ type: 'step', step: 'committees', status: 'running', message: 'Fetching active committees...' });
        const committees = await scrapeCommittees();
        total += committees.count; errors += committees.errors.length;
        emit({
          type: 'step', step: 'committees',
          status: committees.errors.length && !committees.count ? 'error' : 'done',
          message: `${committees.count} committees synced`,
          count: committees.count,
          errors: committees.errors.slice(0, 3),
        });

        // Step 2 — Bills
        if (mode === 'full') {
          emit({ type: 'step', step: 'bills', status: 'running', message: 'Fetching all bills via RSS (one feed per bill)...' });
          let billCount = 0;
          let billErrors = 0;
          const bills = await scrapeAllBills((done, total) => {
            // Emit progress every 25 bills to avoid flooding
            if (done % 25 === 0 || done === total) {
              emit({ type: 'log', message: `  Bills processed: ${done}/${total}` });
            }
          });
          billCount = bills.count; billErrors = bills.errors.length;
          total += billCount; errors += billErrors;
          emit({
            type: 'step', step: 'bills',
            status: billErrors && !billCount ? 'error' : 'done',
            message: `${billCount} bills synced`,
            count: billCount,
            errors: bills.errors.slice(0, 3),
          });
        } else {
          // Daily: just re-sync committees and calendar; bills update when you run full rebuild
          emit({ type: 'step', step: 'bills', status: 'done', message: 'Skipped (run Full Rebuild to sync all bills)', count: 0 });
        }

        // Step 3 — Calendar (upcoming events via RSS)
        emit({ type: 'step', step: 'calendar', status: 'running', message: 'Fetching legislative calendar from RSS...' });
        const calendar = await scrapeCalendar();
        total += calendar.count; errors += calendar.errors.length;
        emit({
          type: 'step', step: 'calendar',
          status: calendar.errors.length && !calendar.count ? 'error' : 'done',
          message: `${calendar.count} calendar events synced`,
          count: calendar.count,
          errors: calendar.errors.slice(0, 3),
        });

        await logScrapeRun(
          `admin_${mode}`,
          errors === 0 ? 'success' : total > 0 ? 'partial' : 'error',
          total,
          `${mode} sync: ${total} records, ${errors} errors`
        );
        emit({ type: 'complete', total, errors });

      } catch (err) {
        emit({ type: 'log', message: `Fatal: ${err instanceof Error ? err.message : String(err)}` });
        emit({ type: 'complete', total, errors: errors + 1 });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
}
