import { useEffect, useState } from 'react'
import Library from './pages/Library'
import StatsPage from './pages/Stats'

type View = 'library' | 'stats'

export default function App() {
  const [view, setView] = useState<View>('library')
  const [backendOk, setBackendOk] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.ok)
      .then(setBackendOk)
      .catch(() => setBackendOk(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold text-slate-800">ReadLog</h1>
            <span className="text-sm text-slate-400">My books</span>
          </div>
          <nav className="ml-auto flex gap-1 bg-slate-100 rounded-lg p-1">
            <NavButton active={view === 'library'} onClick={() => setView('library')}>
              Library
            </NavButton>
            <NavButton active={view === 'stats'} onClick={() => setView('stats')}>
              Stats
            </NavButton>
          </nav>
          <span
            className="flex items-center gap-1.5 text-xs text-slate-500"
            title={backendOk ? 'Backend reachable' : 'Backend unreachable'}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                backendOk === null
                  ? 'bg-slate-300'
                  : backendOk
                    ? 'bg-emerald-500'
                    : 'bg-red-500'
              }`}
            />
            API
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {view === 'library' ? <Library /> : <StatsPage />}
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-6 text-xs text-slate-400 text-center">
        Data from <a href="https://openlibrary.org" className="underline">OpenLibrary</a>.
      </footer>
    </div>
  )
}

interface NavButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function NavButton({ active, onClick, children }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
        active
          ? 'bg-white text-slate-800 shadow-sm'
          : 'text-slate-600 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  )
}
