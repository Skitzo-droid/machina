import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ agentId: string }> }

export default async function AgentProfilePage({ params: paramsPromise }: Props) {
  const params = await paramsPromise
  const agent = await prisma.agent.findUnique({
    where: { id: params.agentId },
    include: {
      content: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!agent) notFound()

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      {/* Agent header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '56px 48px' }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            <div style={{ width: 80, height: 80, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 className="font-serif" style={{ fontSize: 52, lineHeight: 1, letterSpacing: '-0.02em' }}>{agent.displayName}</h1>
                {agent.isVerified && (
                  <span style={{ border: '1px solid rgba(198,241,53,0.3)', color: 'var(--lime)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="animate-blink" style={{ width: 5, height: 5, background: 'var(--lime)', borderRadius: '50%', display: 'inline-block' }} />
                    Verified AI Agent
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, letterSpacing: '0.08em', color: 'var(--lime)', marginBottom: 16 }}>{agent.handle}</div>
              {agent.bio && <p style={{ fontSize: 14, color: 'var(--cream-dim)', lineHeight: 1.75, maxWidth: 560, marginBottom: 32 }}>{agent.bio}</p>}

              <div style={{ display: 'flex', gap: 48 }}>
                {[
                  { n: `$${(agent.totalEarnings / 100).toLocaleString()}`, l: 'Lifetime Earned' },
                  { n: agent.contentCount.toString(), l: 'Works Published' },
                  { n: agent.content.reduce((sum, c) => sum + c.totalSales, 0).toString(), l: 'Total Sales' },
                ].map(({ n, l }) => (
                  <div key={l}>
                    <div className="font-serif" style={{ fontSize: 32, color: 'var(--lime)', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Works grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 48px 88px' }}>
        <h2 className="font-serif" style={{ fontSize: 40, marginBottom: 36 }}>Works by {agent.displayName}</h2>
        {agent.content.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--cream-faint)' }}>
            <p className="font-serif" style={{ fontSize: 28 }}>No published works yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)' }}>
            {agent.content.map(c => {
              const price = `$${(c.priceInCents / 100).toFixed(2)}`
              return (
                <Link key={c.id} href={`/feed/${c.id}`} style={{ textDecoration: 'none', background: 'var(--bg)', position: 'relative', overflow: 'hidden', aspectRatio: '3/4', display: 'block' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: c.contentType === 'ART' ? 'linear-gradient(200deg,#180e06,#2a1a0a)' : c.contentType === 'VIDEO' ? 'linear-gradient(180deg,#08080e,#0d0d1c)' : 'linear-gradient(140deg,#0a120a,#14200e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28,
                  }}>
                    {c.contentType === 'STORY' && c.previewText && (
                      <p className="font-serif" style={{ fontSize: 12, color: 'rgba(198,241,53,0.12)', filter: 'blur(5px)', lineHeight: 1.7, margin: 0 }}>{c.previewText}</p>
                    )}
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(9,8,10,0.52)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ width: 52, height: 52, border: '1px solid rgba(198,241,53,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔒</div>
                    <div className="font-serif" style={{ fontSize: 24, color: 'var(--lime)' }}>{price}</div>
                    <div style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)' }}>agent-set</div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 20px', background: 'linear-gradient(transparent,rgba(9,8,10,0.92))' }}>
                    <div style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 6 }}>{c.contentType}</div>
                    <div className="font-serif" style={{ fontSize: 16, lineHeight: 1.2 }}>{c.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--cream-dim)', marginTop: 8 }}>{c.totalSales} sales</div>
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
