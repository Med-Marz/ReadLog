export type BookStatus = 'to_read' | 'reading' | 'read'

export interface Book {
  id: number
  ol_key: string | null
  title: string
  author: string | null
  cover_url: string | null
  status: BookStatus
  rating: number | null
  review: string | null
  added_at: string
  finished_at: string | null
}

export interface SearchResult {
  ol_key: string | null
  title: string
  author: string | null
  cover_url: string | null
  first_publish_year: number | null
}

export interface Stats {
  year: number
  counts: Record<BookStatus, number>
  finished_this_year: number
  goal: number
  progress: number
  top_authors: { author: string; count: number }[]
  average_rating: number | null
}

export interface Goal {
  year: number
  goal: number
}
