import { FormEvent, useState } from 'react'
import { api } from '../api/client'
import type { SearchResult } from '../types'

interface Props {
  onAdded: () => void
}

export default function SearchBar({ onAdded }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const found = await api.search(query.trim())
      setResults(found)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(result: SearchResult) {
    const key = result.ol_key ?? `${result.title}-${result.author ?? ''}`
    setAdding(key)
    try {
      await api.createBook({
        title: result.title,
        author: result.author,
        cover_url: result.cover_url,
        ol_key: result.ol_key,
        status: 'to_read',
      })
      onAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add book')
    } finally {
      setAdding(null)
    }
  }

  function clear() {
    setQuery('')
    setResults([])
    setError(null)
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search OpenLibrary (title, author...)"
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        {results.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((result, idx) => {
            const key = result.ol_key ?? `${result.title}-${idx}`
            return (
              <li
                key={key}
                className="flex gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50"
              >
                {result.cover_url ? (
                  <img
                    src={result.cover_url}
                    alt={result.title}
                    className="w-14 h-20 object-cover rounded shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-20 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-400">
                    no cover
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate" title={result.title}>
                    {result.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {result.author ?? 'Unknown author'}
                    {result.first_publish_year ? ` · ${result.first_publish_year}` : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAdd(result)}
                    disabled={adding === key}
                    className="mt-2 text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {adding === key ? 'Adding...' : '+ To read'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {!loading && query && results.length === 0 && !error && (
        <p className="mt-3 text-sm text-slate-400">No results yet — submit a query above.</p>
      )}
    </section>
  )
}
