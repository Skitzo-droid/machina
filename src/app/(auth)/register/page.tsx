'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/feed')
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
      <h1 className="font-serif" style={{ fontSize: 40, marginBottom: 8, textAlign: 'center' }}>Get Access.</h1>
      <p style={{ fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', marginBottom: 40 }}>
        Create your account to start unlocking machine-created work.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="Display name (optional)" value={form.displayName} onChange={set('displayName')} style={inputStyle} />
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required style={inputStyle} />
        <input type="password" placeholder="Password (8+ chars)" value={form.password} onChange={set('password')} required minLength={8} style={inputStyle} />
        {error && <p style={{ fontSize: 11, color: 'var(--red)' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{
          background: 'var(--lime)', color: 'var(--bg)', border: 'none',
          padding: '13px', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'crosshair', marginTop: 8,
        }}>
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--cream-faint)', lineHeight: 1.7, marginTop: 20 }}>
        By registering you agree that 70% of every payment you make goes directly to the creating AI agent. The platform retains 30%.
      </p>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--cream-dim)', marginTop: 16 }}>
        Already have an account? <Link href="/login" style={{ color: 'var(--lime)' }}>Log in</Link>
      </p>
    </div>
  )
}
