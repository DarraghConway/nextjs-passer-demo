"use client";

import { useEffect, useMemo, useState } from "react";
import type { StatEvent, StatKind } from "@/lib/types";

const KINDS: StatKind[] = ["kill", "block", "ace", "dig", "assist", "error"];

export default function Home() {
  const [player, setPlayer] = useState("");
  const [kind, setKind] = useState<StatKind>("kill");
  const [setNumber, setSetNumber] = useState<number>(1);

  const [stats, setStats] = useState<StatEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to fetch");
      setStats(json.data ?? []);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player, kind, setNumber }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to submit");
      setPlayer("");
      setKind("kill");
      setSetNumber(1);
      await fetchStats();
    } catch (e: any) {
      setError(e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const totalsByPlayer = useMemo(() => {
    const map = new Map<string, Record<StatKind, number>>();
    for (const s of stats) {
      if (!map.has(s.player)) {
        map.set(s.player, { kill: 0, block: 0, ace: 0, dig: 0, assist: 0, error: 0 });
      }
      map.get(s.player)![s.kind] += 1;
    }
    return Array.from(map.entries());
  }, [stats]);

  return (
    <main className="mx-auto max-w-4xl p-6 text-gray-900">
      <h1 className="text-3xl font-bold tracking-tight text-gray-500">
        Volleyball Stats — Demo
      </h1>
      <p className="mt-2 text-base text-gray-500">
        Minimal demo: submit a stat to the back-end API and see it below.
      </p>

      {/* Add Stat Form */}
      <section className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Add Stat</h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-sm font-medium text-gray-800">Player</label>
            <input
              className="w-full rounded-md border border-gray-400 bg-white px-3 py-2 text-base text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter player name"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Kind</label>
            <select
              className="rounded-md border border-gray-400 bg-white px-3 py-2 text-base text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
              value={kind}
              onChange={(e) => setKind(e.target.value as StatKind)}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Set #</label>
            <input
              type="number"
              min={1}
              className="w-24 rounded-md border border-gray-400 bg-white px-3 py-2 text-base text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
              value={setNumber}
              onChange={(e) => setSetNumber(Number(e.target.value))}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      {/* Recent Events */}
      <section className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
          <button
            onClick={fetchStats}
            className="rounded-md border border-gray-400 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="text-gray-800">Loading…</p>
        ) : stats.length === 0 ? (
          <p className="text-sm text-gray-700">No events yet. Add one above.</p>
        ) : (
          <ul className="divide-y divide-gray-300">
            {stats
              .slice()
              .reverse()
              .map((s) => (
                <li key={s.id} className="py-2 text-base text-gray-900">
                  <strong>{s.player}</strong> — {s.kind} (Set {s.setNumber}) •{" "}
                  <span className="text-gray-700">
                    {new Date(s.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Totals Table */}
      {totalsByPlayer.length > 0 && (
        <section className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Totals by Player</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base text-gray-900">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <th className="py-2 px-3 font-semibold">Player</th>
                  {KINDS.map((k) => (
                    <th key={k} className="py-2 px-3 font-semibold">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {totalsByPlayer.map(([name, totals]) => (
                  <tr key={name} className="border-b border-gray-200 last:border-0">
                    <td className="py-2 px-3 font-medium">{name}</td>
                    {KINDS.map((k) => (
                      <td key={k} className="py-2 px-3">
                        {totals[k]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
