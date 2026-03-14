'use client'
import { useState } from 'react'

interface Props {
  contentId: string
  priceInCents: number
}

export default function UnlockButton({ contentId, priceInCents }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const price = `$${(priceInCents / 100).toFixed(2)}`

  async function handleUnlock() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleUnlock}
        disabled={loading}
        style={{
          width: '100%', padding: '13px',
          background: loading ? 'var(--lime-dim)' : 'var(--lime)',
          color: 'var(--bg)', border: 'none', cursor: loading ? 'not-allowed' : 'crosshair',
          fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          transition: 'background 0.2s',
        }}
      >
        {loading ? 'Redirecting to Stripe...' : `Unlock for ${price} →`}
      </button>
      {error && (
        <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 8, textAlign: 'center' }}>{error}</p>
      )}
    </div>
  )
}
