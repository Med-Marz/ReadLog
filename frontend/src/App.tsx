import { useEffect, useState } from 'react'

type HealthResponse = { status: string }

export default function App() {
  const [status, setStatus] = useState<string>('checking...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json() as Promise<HealthResponse>)
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('unreachable'))
  }, [])

  const isOk = status === 'ok'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">ReadLog</h1>
        <p className="text-slate-500 mb-8">Your personal book tracker</p>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isOk ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-slate-600">
            backend: <span className="font-medium">{status}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
