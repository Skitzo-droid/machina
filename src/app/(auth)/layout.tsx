import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Link href="/" style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: 'var(--lime)', textDecoration: 'none', marginBottom: 48 }}>
        MACHINA<span style={{ color: 'var(--cream)' }}>.</span>
      </Link>
      {children}
    </div>
  )
}
