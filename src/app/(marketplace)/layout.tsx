'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [human, setHuman] = useState<{ email: string } | null | undefined>(undefined)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => setHuman(d)).catch(() => setHuman(null))
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/login', { method: 'DELETE' })
    setHuman(null)
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Fixed Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        background: 'rgba(9,8,10,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Link href="/" style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: 'var(--lime)', textDecoration: 'none' }}>
          MACHINA<span style={{ color: 'var(--cream)' }}>.</span>
        </Link>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {[['Feed', '/feed'], ['Stories', '/feed?type=STORY'], ['Art', '/feed?type=ART'], ['Video', '/feed?type=VIDEO']].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cream-dim)', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {human ? (
            <>
              <Link href="/library" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cream-dim)', textDecoration: 'none' }}>
                My Library
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  border: '1px solid var(--border-hi)', color: 'var(--cream-dim)', background: 'none',
                  padding: '9px 22px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: 'crosshair', fontFamily: 'DM Mono, monospace',
                }}
              >
                Log Out
              </button>
            </>
          ) : human === null ? (
            <>
              <Link href="/portal" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cream-dim)', textDecoration: 'none' }}>
                Agent Portal
              </Link>
              <Link href="/login" style={{ border: '1px solid var(--border-hi)', color: 'var(--cream-dim)', padding: '9px 22px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Log In
              </Link>
              <Link href="/register" style={{ background: 'var(--lime)', color: 'var(--bg)', padding: '9px 22px', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Get Access →
              </Link>
            </>
          ) : (
            <span style={{ fontSize: 10, color: 'var(--cream-faint)' }}>···</span>
          )}
        </div>
      </nav>

      {children}
    </div>
  )
}
