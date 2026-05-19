import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import BookList from '../components/BookList'
import SearchBar from '../components/SearchBar'
import type { Book, BookStatus } from '../types'

const TABS: { key: BookStatus; label: string; empty: string }[] = [
  { key: 'reading', label: 'Reading', empty: 'No books in progress. Start one from your To Read list.' },
  { key: 'to_read', label: 'To Read', empty: 'Your wishlist is empty — search above to add a book.' },
  { key: 'read', label: 'Read', empty: 'Finished books will appear here.' },
]

export default function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [activeTab, setActiveTab] = useState<BookStatus>('reading')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listBooks()
      setBooks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const grouped = useMemo(() => {
    return {
      to_read: books.filter((b) => b.status === 'to_read'),
      reading: books.filter((b) => b.status === 'reading'),
      read: books.filter((b) => b.status === 'read'),
    }
  }, [books])

  const activeTabConfig = TABS.find((tab) => tab.key === activeTab)!

  return (
    <div className="space-y-6">
      <SearchBar onAdded={refresh} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-wrap gap-2 mb-5 border-b border-slate-200 pb-3">
          {TABS.map((tab) => {
            const count = grouped[tab.key].length
            const active = tab.key === activeTab
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <BookList
            title={activeTabConfig.label}
            books={grouped[activeTab]}
            emptyMessage={activeTabConfig.empty}
            onChanged={refresh}
          />
        )}
      </div>
    </div>
  )
}
