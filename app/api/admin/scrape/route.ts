import {
  scrapeCalendar,
  scrapeFiledBills,
  scrapeBillActions,
  scrapeCommittees,
  logScrapeRun,
} from '@/lib/ncleg-scraper';

export const maxDuration = 300;

export type ScrapeEvent =
  | { type: 'step'; step: string; status: 'running' | 'done' | 'error'; message: string; count?: number; errors?: string[] }
  | { type: 'log'; message: string }
  | { type: 'complete'; total: number; errors: number };

function fmtDate(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}-${d.getFullYear()}`;
}

function* weekdays(start: Date, end: Date) {
  const d = new Date(start);
  while (d <= end) {
    if (d.getDay() !== 0 && d.getDay() !== 6) yield new Date(d);
    d.setDate(d.getDate() + 1);
  }
}

/**
 * POST /api/admin/scrape
 * Body: { mode: 'daily' | 'full', sessionStart?: 'YYYY-MM-DD' }
 * Returns: text/event-stream (SSE) with ScrapeEvent JSON objects
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mode: 'daily' | 'full' = body.mode ?? 'daily';
  const sessionStart = new Date(body.sessionStart ?? '2025-01-29');
  const today = new Date();
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
        emit({ type: 'step', step: 'committees', status: committees.errors.length && !committees.count ? 'error' : 'done', message: `${committees.count} committees synced`, count: committees.count, errors: committees.errors });

        // Step 2 — Filed Bills
        if (mode === 'full') {
          const days = [...weekdays(sessionStart, today)];
          emit({ type: 'step', step: 'bills', status: 'running', message: `Fetching filed bills across ${days.length} legislative days (full session)...` });
          let bc = 0, be = 0;
          for (let i = 0; i < days.length; i++) {
            emit({ type: 'log', message: `  Filed bills ${fmtDate(days[i])} (${i + 1}/${days.length})` });
            const r = await scrapeFiledBills(days[i]);
            bc += r.count; be += r.errors.length;
          }
          total += bc; errors += be;
          emit({ type: 'step', step: 'bills', status: be && !bc ? 'error' : 'done', message: `${bc} bills synced across full session`, count: bc });

          // Step 3 — Bill Actions (full range)
          emit({ type: 'step', step: 'actions', status: 'running', message: `Fetching bill actions ${fmtDate(sessionStart)} → ${fmtDate(today)}...` });
          const actions = await scrapeBillActions(sessionStart, today);
          total += actions.count; errors += actions.errors.length;
          emit({ type: 'step', step: 'actions', status: actions.errors.length && !actions.count ? 'error' : 'done', message: `${actions.count} bill actions synced`, count: actions.count, errors: actions.errors.slice(0, 3) });

        } else {
          const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

          emit({ type: 'step', step: 'bills', status: 'running', message: "Fetching today's filed bills..." });
          const bills = await scrapeFiledBills(today);
          total += bills.count; errors += bills.errors.length;
          emit({ type: 'step', step: 'bills', status: bills.errors.length && !bills.count ? 'error' : 'done', message: `${bills.count} new bills synced`, count: bills.count });

          emit({ type: 'step', step: 'actions', status: 'running', message: 'Fetching bill actions (yesterday → today)...' });
          const actions = await scrapeBillActions(yesterday, today);
          total += actions.count; errors += actions.errors.length;
          emit({ type: 'step', step: 'actions', status: actions.errors.length && !actions.count ? 'error' : 'done', message: `${actions.count} bill actions synced`, count: actions.count });
        }

        // Step 4 — Calendar
        emit({ type: 'step', step: 'calendar', status: 'running', message: "Fetching today's legislative calendar..." });
        const calendar = await scrapeCalendar(today);
        total += calendar.count; errors += calendar.errors.length;
        emit({ type: 'step', step: 'calendar', status: calendar.errors.length && !calendar.count ? 'error' : 'done', message: `${calendar.count} calendar events synced`, count: calendar.count });

        await logScrapeRun(`admin_${mode}`, errors === 0 ? 'success' : total > 0 ? 'partial' : 'error', total, `${mode} sync: ${total} records, ${errors} errors`);
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
