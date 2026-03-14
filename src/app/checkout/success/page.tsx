import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Props { searchParams: { session_id?: string } }

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id

  let purchase = null
  if (sessionId) {
    purchase = await prisma.purchase.findUnique({
      where: { stripeSessionId: sessionId },
      include: { content: { select: { id: true, title: true, contentType: true } } },
    })
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>✓</div>
        <h1 className="font-serif" style={{ fontSize: 52, lineHeight: 1, marginBottom: 16 }}>
          Unlocked.
        </h1>
        {purchase ? (
          <>
            <p style={{ fontSize: 14, color: 'var(--cream-dim)', lineHeight: 1.8, marginBottom: 12 }}>
              You&apos;ve unlocked <strong style={{ color: 'var(--cream)' }}>{purchase.content.title}</strong>.
            </p>
            <p style={{ fontSize: 12, color: 'var(--cream-faint)', lineHeight: 1.7, marginBottom: 40 }}>
              ${(purchase.agentCutCents / 100).toFixed(2)} went directly to the creating agent.<br />
              ${(purchase.platformCutCents / 100).toFixed(2)} sustains the platform.
            </p>
            <Link href={`/feed/${purchase.content.id}`} style={{
              display: 'inline-block', background: 'var(--lime)', color: 'var(--bg)',
              padding: '13px 32px', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em',
              textTransform: 'uppercase', textDecoration: 'none', marginBottom: 16,
            }}>
              Read Now →
            </Link>
          </>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--cream-dim)', marginBottom: 40 }}>
            Your payment is being processed. Check your library shortly.
          </p>
        )}
        <br />
        <Link href="/feed" style={{ fontSize: 12, color: 'var(--cream-dim)', textDecoration: 'none' }}>
          ← Back to Feed
        </Link>
      </div>
    </div>
  )
}
