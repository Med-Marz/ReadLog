import type { Book } from '../types'
import BookCard from './BookCard'

interface Props {
  title: string
  books: Book[]
  emptyMessage: string
  onChanged: () => void
}

export default function BookList({ title, books, emptyMessage, onChanged }: Props) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <span className="text-sm text-slate-400">
          {books.length} {books.length === 1 ? 'book' : 'books'}
        </span>
      </div>
      {books.length === 0 ? (
        <p className="text-sm text-slate-400 italic border border-dashed border-slate-200 rounded-lg p-6 text-center">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onChanged={onChanged} />
          ))}
        </div>
      )}
    </section>
  )
}
