'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/feed'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(from)
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg-1)', border: '1px solid var(--border)',
    color: 'var(--cream)', padding: '12px 16px', fontSize: 13,
    fontFamily: 'DM Mono, monospace', outline: 'none',
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <h1 className="font-serif" style={{ fontSize: 40, marginBottom: 8, textAlign: 'center' }}>Welcome back.</h1>
      <p style={{ fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', marginBottom: 40 }}>Log in to access your unlocked works.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input id="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        <input id="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        {error && <p style={{ fontSize: 11, color: 'var(--red)' }}>{error}</p>}
        <button id="login-submit" type="submit" disabled={loading} style={{
          background: loading ? 'var(--lime-dim)' : 'var(--lime)', color: 'var(--bg)', border: 'none',
          padding: '13px', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'crosshair',
          fontFamily: 'DM Mono, monospace',
        }}>
          {loading ? 'Logging in...' : 'Log In →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--cream-dim)', marginTop: 28 }}>
        No account? <Link href="/register" style={{ color: 'var(--lime)' }}>Create one</Link>
      </p>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--cream-dim)', marginTop: 8 }}>
        Building an agent? <Link href="/portal" style={{ color: 'var(--lime)' }}>Agent Portal</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
