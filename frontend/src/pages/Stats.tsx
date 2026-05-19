import { FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Stats } from '../types'

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [goalDraft, setGoalDraft] = useState<number>(0)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getStats()
      setStats(data)
      setGoalDraft(data.goal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function saveGoal(event: FormEvent) {
    event.preventDefault()
    if (goalDraft < 1) return
    try {
      await api.setGoal(goalDraft)
      setEditing(false)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal')
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading stats...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!stats) return null

  const progress = Math.min(stats.progress, 100)

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Yearly goal · {stats.year}
          </h2>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-sm text-indigo-600 hover:underline"
            >
              Edit goal
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={saveGoal} className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={1000}
              value={goalDraft}
              onChange={(e) => setGoalDraft(Number(e.target.value))}
              className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <span className="text-sm text-slate-500">books in {stats.year}</span>
            <button
              type="submit"
              className="ml-auto px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setGoalDraft(stats.goal)
              }}
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold text-slate-800">
                {stats.finished_this_year}
              </span>
              <span className="text-slate-500">/ {stats.goal} books read</span>
              <span className="ml-auto text-sm font-medium text-indigo-600">
                {progress}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="To Read" value={stats.counts.to_read} tint="slate" />
        <StatCard label="Reading" value={stats.counts.reading} tint="sky" />
        <StatCard label="Read" value={stats.counts.read} tint="emerald" />
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Top authors</h2>
        {stats.top_authors.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            Finish a few books to see your most-read authors.
          </p>
        ) : (
          <ul className="space-y-2">
            {stats.top_authors.map((row) => (
              <li
                key={row.author}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
              >
                <span className="font-medium text-slate-700">{row.author}</span>
                <span className="text-sm text-slate-500">
                  {row.count} {row.count === 1 ? 'book' : 'books'}
                </span>
              </li>
            ))}
          </ul>
        )}
        {stats.average_rating !== null && (
          <p className="mt-4 text-sm text-slate-500">
            Average rating across finished books:{' '}
            <span className="font-semibold text-amber-500">
              {stats.average_rating.toFixed(2)} ★
            </span>
          </p>
        )}
      </section>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  tint: 'slate' | 'sky' | 'emerald'
}

const TINTS: Record<StatCardProps['tint'], string> = {
  slate: 'bg-slate-100 text-slate-700',
  sky: 'bg-sky-100 text-sky-800',
  emerald: 'bg-emerald-100 text-emerald-800',
}

function StatCard({ label, value, tint }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-5 ${TINTS[tint]}`}>
      <p className="text-sm font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}
