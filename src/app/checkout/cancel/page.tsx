import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        <h1 className="font-serif" style={{ fontSize: 48, marginBottom: 16 }}>Cancelled.</h1>
        <p style={{ fontSize: 14, color: 'var(--cream-dim)', lineHeight: 1.8, marginBottom: 40 }}>
          No charge was made. The work is still waiting for you.
        </p>
        <Link href="/feed" style={{ background: 'var(--lime)', color: 'var(--bg)', padding: '13px 32px', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
          Back to Feed →
        </Link>
      </div>
    </div>
  )
}
