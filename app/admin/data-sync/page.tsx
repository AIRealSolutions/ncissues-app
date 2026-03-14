'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { ScrapeEvent } from '@/app/api/admin/scrape/route';

// ── Types ──────────────────────────────────────────────────────────────────

type StepId = 'committees' | 'bills' | 'calendar';
type StepStatus = 'idle' | 'running' | 'done' | 'error';

interface Step {
  id: StepId;
  label: string;
  icon: string;
  status: StepStatus;
  message: string;
  count: number;
}

const INITIAL_STEPS: Step[] = [
  { id: 'committees', label: 'Committees', icon: '🏛️', status: 'idle', message: '', count: 0 },
  { id: 'bills',      label: 'Bills (RSS)', icon: '📋', status: 'idle', message: '', count: 0 },
  { id: 'calendar',   label: 'Calendar',   icon: '📅', status: 'idle', message: '', count: 0 },
];

const SQL_LINK = 'https://supabase.com/dashboard/project/bmwzjybppjneyejlsjpv/sql';

// ── Helpers ────────────────────────────────────────────────────────────────

function statusColor(s: StepStatus) {
  return s === 'done' ? 'text-green-600' : s === 'error' ? 'text-red-600' : s === 'running' ? 'text-blue-600' : 'text-gray-400';
}

function statusBg(s: StepStatus) {
  return s === 'done' ? 'bg-green-50 border-green-200' : s === 'error' ? 'bg-red-50 border-red-200' : s === 'running' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200';
}

function statusIcon(s: StepStatus) {
  if (s === 'done') return '✅';
  if (s === 'error') return '❌';
  if (s === 'running') return '⏳';
  return '⬜';
}

// ── Component ──────────────────────────────────────────────────────────────

export default function DataSyncPage() {
  const [mode, setMode] = useState<'daily' | 'full'>('daily');
  const [sessionStart, setSessionStart] = useState('2025-01-29');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<{ total: number; errors: number } | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const doneSteps = steps.filter(s => s.status === 'done' || s.status === 'error').length;
  const progress = running || result ? Math.round((doneSteps / steps.length) * 100) : 0;

  function updateStep(id: StepId, patch: Partial<Step>) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function addLog(msg: string) {
    setLogs(prev => [...prev, msg]);
    setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  async function startSync() {
    setRunning(true);
    setResult(null);
    setLogs([]);
    setSteps(INITIAL_STEPS);

    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, sessionStart }),
      });

      if (!res.ok || !res.body) {
        addLog(`Error: HTTP ${res.status}`);
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event: ScrapeEvent = JSON.parse(line.slice(6));

            if (event.type === 'step') {
              updateStep(event.step as StepId, {
                status: event.status,
                message: event.message,
                count: event.count ?? 0,
              });
              addLog(`${statusIcon(event.status)} ${event.message}`);
              if (event.errors?.length) {
                event.errors.forEach(e => addLog(`  ⚠️ ${e}`));
              }
            } else if (event.type === 'log') {
              addLog(event.message);
            } else if (event.type === 'complete') {
              setResult({ total: event.total, errors: event.errors });
            }
          } catch {}
        }
      }
    } catch (err) {
      addLog(`Connection error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003087] text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-blue-300 hover:text-white text-sm">← Admin</Link>
        <h1 className="text-xl font-bold">Data Sync</h1>
        <span className="text-blue-300 text-sm ml-auto">ncleg.gov → Supabase</span>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Step 0: Schema notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="font-semibold text-amber-800 mb-2">⚠️ First time? Set up the database schema</h2>
          <p className="text-sm text-amber-700 mb-3">
            Run <code className="bg-amber-100 px-1 rounded">database/schema.sql</code> in the Supabase SQL Editor to create all required tables before syncing.
          </p>
          <a
            href={SQL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Open Supabase SQL Editor →
          </a>
        </div>

        {/* Mode selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Sync Mode</h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('daily')}
              disabled={running}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mode === 'daily' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-semibold text-gray-900">Daily Update</div>
              <div className="text-sm text-gray-500 mt-1">
                Syncs today's new bills, actions, and calendar. Fast (~10 seconds).
              </div>
            </button>

            <button
              onClick={() => setMode('full')}
              disabled={running}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mode === 'full' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold text-gray-900">Full Rebuild</div>
              <div className="text-sm text-gray-500 mt-1">
                Rebuilds entire session from scratch. Use after resetting the database.
              </div>
            </button>
          </div>

          {mode === 'full' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Start Date</label>
              <input
                type="date"
                value={sessionStart}
                onChange={e => setSessionStart(e.target.value)}
                disabled={running}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">2025 session began January 29, 2025</p>
            </div>
          )}

          <button
            onClick={startSync}
            disabled={running}
            className="w-full py-3 px-6 bg-[#003087] text-white font-semibold rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {running ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Syncing...
              </>
            ) : (
              <>▶ Run {mode === 'full' ? 'Full Rebuild' : 'Daily Update'}</>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {(running || result) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-lg">Progress</h2>
              <span className="text-sm font-medium text-gray-600">{progress}%</span>
            </div>

            {/* Bar */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#003087] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-2 gap-3">
              {steps.map(step => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${statusBg(step.status)}`}
                >
                  <span className="text-xl shrink-0">{step.icon}</span>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${statusColor(step.status)}`}>
                      {step.label}
                    </div>
                    {step.message ? (
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{step.message}</div>
                    ) : (
                      <div className="text-xs text-gray-400 mt-0.5">Waiting...</div>
                    )}
                    {step.count > 0 && (
                      <div className="text-xs font-medium text-gray-700 mt-1">{step.count.toLocaleString()} records</div>
                    )}
                  </div>
                  <span className="ml-auto shrink-0">{statusIcon(step.status)}</span>
                </div>
              ))}
            </div>

            {/* Result banner */}
            {result && (
              <div className={`rounded-lg p-4 text-center font-semibold ${
                result.errors === 0 ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
              }`}>
                {result.errors === 0
                  ? `✅ Sync complete — ${result.total.toLocaleString()} records updated`
                  : `⚠️ Sync finished with ${result.errors} error(s) — ${result.total.toLocaleString()} records updated`}
              </div>
            )}
          </div>
        )}

        {/* Live log */}
        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 max-h-64 overflow-y-auto">
            {logs.map((line, i) => (
              <div key={i} className="leading-5">{line}</div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
