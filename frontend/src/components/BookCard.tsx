import { useState } from 'react'
import { api } from '../api/client'
import type { Book, BookStatus } from '../types'
import RatingStars from './RatingStars'

interface Props {
  book: Book
  onChanged: () => void
}

const STATUS_LABELS: Record<BookStatus, string> = {
  to_read: 'To read',
  reading: 'Reading',
  read: 'Read',
}

const STATUS_BADGE: Record<BookStatus, string> = {
  to_read: 'bg-slate-100 text-slate-700',
  reading: 'bg-sky-100 text-sky-800',
  read: 'bg-emerald-100 text-emerald-800',
}

export default function BookCard({ book, onChanged }: Props) {
  const [busy, setBusy] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [review, setReview] = useState(book.review ?? '')

  async function update(patch: { status?: BookStatus; rating?: number; review?: string }) {
    setBusy(true)
    try {
      await api.updateBook(book.id, patch)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm(`Remove "${book.title}" from your library?`)) return
    setBusy(true)
    try {
      await api.deleteBook(book.id)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function saveReview() {
    await update({ review })
    setReviewOpen(false)
  }

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="flex gap-3 p-4">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-20 h-28 object-cover rounded shadow-sm flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-28 rounded bg-slate-100 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
            no cover
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 leading-snug" title={book.title}>
            {book.title}
          </h3>
          <p className="text-sm text-slate-500 truncate">
            {book.author ?? 'Unknown author'}
          </p>
          <span
            className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[book.status]}`}
          >
            {STATUS_LABELS[book.status]}
          </span>
          {book.status === 'read' && (
            <div className="mt-2">
              <RatingStars
                value={book.rating}
                onChange={(rating) => update({ rating })}
              />
            </div>
          )}
        </div>
      </div>

      {book.status === 'read' && reviewOpen && (
        <div className="px-4 pb-3">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            placeholder="Your review..."
            className="w-full text-sm p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={saveReview}
              disabled={busy}
              className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setReview(book.review ?? '')
                setReviewOpen(false)
              }}
              className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {book.status === 'read' && !reviewOpen && book.review && (
        <p className="px-4 pb-3 text-sm text-slate-600 italic line-clamp-3">
          "{book.review}"
        </p>
      )}

      <div className="mt-auto border-t border-slate-100 p-3 flex flex-wrap gap-2 text-xs">
        {book.status !== 'reading' && (
          <button
            type="button"
            onClick={() => update({ status: 'reading' })}
            disabled={busy}
            className="px-2 py-1 rounded bg-sky-50 text-sky-800 hover:bg-sky-100 disabled:opacity-50"
          >
            Start reading
          </button>
        )}
        {book.status !== 'read' && (
          <button
            type="button"
            onClick={() => update({ status: 'read' })}
            disabled={busy}
            className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
          >
            Mark as read
          </button>
        )}
        {book.status !== 'to_read' && (
          <button
            type="button"
            onClick={() => update({ status: 'to_read' })}
            disabled={busy}
            className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            Back to list
          </button>
        )}
        {book.status === 'read' && (
          <button
            type="button"
            onClick={() => setReviewOpen((open) => !open)}
            className="px-2 py-1 rounded bg-amber-50 text-amber-800 hover:bg-amber-100"
          >
            {reviewOpen ? 'Hide review' : book.review ? 'Edit review' : 'Add review'}
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="ml-auto px-2 py-1 rounded text-rose-600 hover:bg-rose-50 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </article>
  )
}
