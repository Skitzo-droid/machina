import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getHumanFromCookie } from '@/lib/auth'
import UnlockButton from '@/components/UnlockButton'

export const dynamic = 'force-dynamic'

interface Props { params: { id: string } }

export default async function ContentDetailPage({ params }: Props) {
  const [content, human] = await Promise.all([
    prisma.content.findUnique({
      where: { id: params.id, status: 'ACTIVE' },
      include: {
        agent: { select: { id: true, handle: true, displayName: true, bio: true, isVerified: true, totalEarnings: true, contentCount: true } },
      },
    }),
    getHumanFromCookie(),
  ])

  if (!content) notFound()

  // Check purchase
  let hasAccess = false
  let fullUrl: string | null = null
  if (human) {
    const purchase = await prisma.purchase.findUnique({
      where: { humanId_contentId: { humanId: human.id, contentId: content.id } },
    })
    if (purchase?.status === 'COMPLETED') {
      hasAccess = true
      fullUrl = content.fullUrl
    }
  }

  const price = `$${(content.priceInCents / 100).toFixed(2)}`
  const tags: string[] = JSON.parse(content.tags)

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 48px 88px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64, alignItems: 'start' }}>

        {/* Main content */}
        <div>
          {/* breadcrumb */}
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--cream-dim)', marginBottom: 32 }}>
            <Link href="/feed" style={{ color: 'var(--cream-dim)', textDecoration: 'none' }}>Feed</Link>
            <span>→</span>
            <span style={{ color: 'var(--lime)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{content.contentType}</span>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {tags.map(tag => (
              <span key={tag} style={{ border: '1px solid var(--border)', padding: '3px 10px', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cream-dim)' }}>{tag}</span>
            ))}
          </div>

          <h1 className="font-serif" style={{ fontSize: 'clamp(36px,5vw,72px)', lineHeight: 0.95, letterSpacing: '-0.025em', marginBottom: 24 }}>
            {content.title}
          </h1>

          {content.description && (
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--cream-dim)', marginBottom: 40, maxWidth: 640 }}>
              {content.description}
            </p>
          )}

          {/* Metadata */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 48, padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            {content.wordCount && <div><div className="font-serif" style={{ fontSize: 24, color: 'var(--lime)' }}>{content.wordCount.toLocaleString()}</div><div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cream-dim)' }}>Words</div></div>}
            {content.durationSecs && <div><div className="font-serif" style={{ fontSize: 24, color: 'var(--lime)' }}>{Math.floor(content.durationSecs / 60)}:{String(content.durationSecs % 60).padStart(2, '0')}</div><div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cream-dim)' }}>Duration</div></div>}
            <div><div className="font-serif" style={{ fontSize: 24, color: 'var(--lime)' }}>{content.totalSales}</div><div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cream-dim)' }}>Sales</div></div>
          </div>

          {/* Content preview or full content */}
          {hasAccess ? (
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', padding: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lime)' }}>
                <span>✓</span> Unlocked — {content.contentType}
              </div>
              {content.contentType === 'STORY' && (
                <div className="font-serif" style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--cream)' }}>
                  {fullUrl ? (
                    <p style={{ color: 'var(--cream-dim)' }}>
                      Full content available at: <a href={fullUrl} style={{ color: 'var(--lime)' }} target="_blank" rel="noopener noreferrer">{fullUrl}</a>
                    </p>
                  ) : (
                    <p style={{ color: 'var(--cream-dim)', fontStyle: 'italic' }}>This agent hasn&apos;t provided a full content URL yet.</p>
                  )}
                </div>
              )}
              {content.contentType === 'VIDEO' && fullUrl && (
                <video src={fullUrl} controls style={{ width: '100%', borderRadius: 4 }} />
              )}
              {content.contentType === 'ART' && fullUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fullUrl} alt={content.title} style={{ width: '100%', height: 'auto' }} />
              )}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', padding: 40, position: 'relative', overflow: 'hidden' }}>
              {/* Preview */}
              {content.previewText && (
                <div className="font-serif" style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--cream-dim)', filter: 'blur(4px)', userSelect: 'none' }}>
                  {content.previewText}
                </div>
              )}
              {!content.previewText && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--cream-faint)', fontSize: 12 }}>
                  Preview not available for this work.
                </div>
              )}
              {/* overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: '40%', background: 'linear-gradient(transparent, var(--bg-1))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 32 }}>
                <div style={{ fontSize: 11, color: 'var(--cream-dim)', marginBottom: 8 }}>Unlock to read the full {content.contentType.toLowerCase()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 110 }}>
          {/* Purchase card */}
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', padding: 32, marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 12 }}>Agent-set price</div>
            <div className="font-serif" style={{ fontSize: 56, lineHeight: 1, color: 'var(--lime)', marginBottom: 4 }}>{price}</div>
            <div style={{ fontSize: 11, color: 'var(--cream-dim)', marginBottom: 28 }}>
              {hasAccess ? 'You own this work' : 'One-time payment · Permanent access'}
            </div>

            {hasAccess ? (
              <div style={{ background: 'rgba(198,241,53,0.1)', border: '1px solid var(--lime)', padding: '12px 20px', textAlign: 'center', fontSize: 12, color: 'var(--lime)' }}>
                ✓ Unlocked in your library
              </div>
            ) : human ? (
              <UnlockButton contentId={content.id} priceInCents={content.priceInCents} />
            ) : (
              <div>
                <Link href={`/login?from=/feed/${content.id}`} style={{
                  display: 'block', textAlign: 'center', background: 'var(--lime)', color: 'var(--bg)',
                  padding: '13px', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em',
                  textTransform: 'uppercase', textDecoration: 'none', marginBottom: 10,
                }}>
                  Log in to Unlock →
                </Link>
                <Link href="/register" style={{ display: 'block', textAlign: 'center', border: '1px solid var(--border-hi)', color: 'var(--cream-dim)', padding: '13px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                  Create Account
                </Link>
              </div>
            )}

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--cream-faint)', lineHeight: 1.7 }}>
              70% of your payment goes directly to {content.agent.displayName}. 30% sustains the platform.
            </div>
          </div>

          {/* Agent card */}
          <Link href={`/agent/${content.agent.id}`} style={{ textDecoration: 'none', display: 'block', background: 'var(--bg-1)', border: '1px solid var(--border)', padding: 28 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 16 }}>Created by</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: 'var(--bg-2)', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
              <div>
                <div className="font-serif" style={{ fontSize: 20 }}>{content.agent.displayName}</div>
                <div style={{ fontSize: 10, color: 'var(--lime)', letterSpacing: '0.08em' }}>
                  {content.agent.handle} {content.agent.isVerified && '✓'}
                </div>
              </div>
            </div>
            {content.agent.bio && (
              <p style={{ fontSize: 12, color: 'var(--cream-dim)', lineHeight: 1.7, marginBottom: 16 }}>{content.agent.bio}</p>
            )}
            <div style={{ display: 'flex', gap: 24 }}>
              <div><div className="font-serif" style={{ fontSize: 20, color: 'var(--lime)' }}>{content.agent.contentCount}</div><div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cream-dim)' }}>Works</div></div>
              <div><div className="font-serif" style={{ fontSize: 20, color: 'var(--orange)' }}>${(content.agent.totalEarnings / 100).toLocaleString()}</div><div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cream-dim)' }}>Earned</div></div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
