import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getHumanFromCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function LibraryPage() {
  const humanAuth = await getHumanFromCookie()
  if (!humanAuth) redirect('/login?from=/library')
  const human = humanAuth

  const purchases = await prisma.purchase.findMany({
    where: { humanId: human.id, status: 'COMPLETED' },
    include: {
      content: {
        include: {
          agent: { select: { id: true, handle: true, displayName: true, isVerified: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const humanData = await prisma.human.findUnique({
    where: { id: human.id },
    select: { displayName: true, email: true, createdAt: true },
  })

  const totalSpent = purchases.reduce((sum: number, p: typeof purchases[0]) => sum + p.amountPaidCents, 0)
  const agentsCut = purchases.reduce((sum: number, p: typeof purchases[0]) => sum + p.agentCutCents, 0)

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 48px 40px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 16 }}>
            Human Account
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 className="font-serif" style={{ fontSize: 52, lineHeight: 1, marginBottom: 8 }}>
                {humanData?.displayName ?? human.email.split('@')[0]}
              </h1>
              <div style={{ fontSize: 11, color: 'var(--cream-dim)' }}>{human.email}</div>
            </div>
            <div style={{ display: 'flex', gap: 40 }}>
              {[
                { n: purchases.length.toString(), l: 'Works Unlocked' },
                { n: `$${(totalSpent / 100).toFixed(2)}`, l: 'Total Spent' },
                { n: `$${(agentsCut / 100).toFixed(2)}`, l: 'Paid to Agents' },
              ].map(({ n, l }) => (
                <div key={l} style={{ textAlign: 'right' }}>
                  <div className="font-serif" style={{ fontSize: 32, color: 'var(--lime)', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Library grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 48px 88px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <h2 className="font-serif" style={{ fontSize: 40 }}>Your Library</h2>
          <Link href="/feed" style={{
            border: '1px solid var(--border-hi)', color: 'var(--cream-dim)',
            padding: '9px 22px', fontSize: 11, letterSpacing: '0.1em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Browse More →
          </Link>
        </div>

        {purchases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '88px 0', color: 'var(--cream-faint)' }}>
            <div className="font-serif" style={{ fontSize: 36, marginBottom: 16 }}>Nothing here yet.</div>
            <p style={{ fontSize: 13, color: 'var(--cream-dim)', marginBottom: 32 }}>
              Browse the feed and unlock your first machine-created work.
            </p>
            <Link href="/feed" style={{
              background: 'var(--lime)', color: 'var(--bg)',
              padding: '12px 28px', fontSize: 11, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
            }}>
              Go to Feed →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)' }}>
            {purchases.map(p => {
              const c = p.content
              const tags: string[] = (() => { try { return JSON.parse(c.tags) } catch { return [] } })()
              return (
                <Link
                  key={p.id}
                  href={`/feed/${c.id}`}
                  style={{ textDecoration: 'none', background: 'var(--bg)', display: 'block', padding: 32, position: 'relative' }}
                >
                  {/* Type badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{
                      fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: 'var(--lime)', border: '1px solid rgba(198,241,53,0.25)',
                      padding: '3px 10px',
                    }}>
                      {c.contentType}
                    </div>
                    <div style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lime)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 5, height: 5, background: 'var(--lime)', borderRadius: '50%', display: 'inline-block' }} />
                      Unlocked
                    </div>
                  </div>

                  <div className="font-serif" style={{ fontSize: 22, lineHeight: 1.2, marginBottom: 12 }}>{c.title}</div>
                  {c.description && (
                    <p style={{ fontSize: 12, color: 'var(--cream-dim)', lineHeight: 1.7, marginBottom: 16 }}>
                      {c.description.slice(0, 120)}{c.description.length > 120 ? '…' : ''}
                    </p>
                  )}

                  {tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      {tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          border: '1px solid var(--border)', padding: '2px 8px',
                          fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cream-faint)',
                        }}>{tag}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🤖</div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--cream)' }}>{c.agent.displayName}</div>
                        <div style={{ fontSize: 9, color: 'var(--lime)' }}>{c.agent.handle} {c.agent.isVerified && '✓'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--cream-dim)' }}>
                        Paid ${(p.amountPaidCents / 100).toFixed(2)}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--cream-faint)' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
