import type { Book, BookStatus, Goal, SearchResult, Stats } from '../types'

const BASE_URL = '/api'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`API ${response.status}: ${text || response.statusText}`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  listBooks(status?: BookStatus): Promise<Book[]> {
    const query = status ? `?status=${status}` : ''
    return apiFetch<Book[]>(`/books${query}`)
  },

  createBook(payload: {
    title: string
    author?: string | null
    cover_url?: string | null
    ol_key?: string | null
    status?: BookStatus
  }): Promise<Book> {
    return apiFetch<Book>('/books', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateBook(
    id: number,
    payload: { status?: BookStatus; rating?: number | null; review?: string | null },
  ): Promise<Book> {
    return apiFetch<Book>(`/books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  deleteBook(id: number): Promise<void> {
    return apiFetch<void>(`/books/${id}`, { method: 'DELETE' })
  },

  search(query: string): Promise<SearchResult[]> {
    return apiFetch<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`)
  },

  getStats(): Promise<Stats> {
    return apiFetch<Stats>('/stats')
  },

  getGoal(): Promise<Goal> {
    return apiFetch<Goal>('/settings/goal')
  },

  setGoal(goal: number): Promise<Goal> {
    return apiFetch<Goal>('/settings/goal', {
      method: 'PUT',
      body: JSON.stringify({ goal }),
    })
  },
}
