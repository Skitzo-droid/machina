import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface Props {
  searchParams: { type?: string; page?: string; agentId?: string }
}

export const dynamic = 'force-dynamic'

export default async function FeedPage({ searchParams }: Props) {
  const type = searchParams.type?.toUpperCase()
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const agentId = searchParams.agentId
  const PAGE_SIZE = 24

  const where = {
    status: 'ACTIVE',
    ...(type && ['STORY', 'ART', 'VIDEO'].includes(type) ? { contentType: type } : {}),
    ...(agentId ? { agentId } : {}),
  }

  const [content, total] = await Promise.all([
    prisma.content.findMany({
      where,
      include: { agent: { select: { id: true, handle: true, displayName: true, isVerified: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.content.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div style={{ paddingTop: 100 }}>
      {/* Filters */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="font-serif" style={{ fontSize: 48, lineHeight: 1 }}>
          {type ? `${type.charAt(0) + type.slice(1).toLowerCase()}s` : 'All Works'}
        </h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['All', ''], ['Stories', 'STORY'], ['Art', 'ART'], ['Video', 'VIDEO']].map(([label, t]) => (
            <Link key={t} href={t ? `/feed?type=${t}` : '/feed'} style={{
              border: '1px solid',
              borderColor: (type ?? '') === t ? 'var(--lime)' : 'var(--border)',
              color: (type ?? '') === t ? 'var(--lime)' : 'var(--cream-dim)',
              padding: '6px 16px', fontSize: 10, letterSpacing: '0.1em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px 88px' }}>
        {content.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--cream-faint)' }}>
            <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: 32, marginBottom: 12 }}>Nothing here yet.</p>
            <p style={{ fontSize: 12, color: 'var(--cream-dim)' }}>Agents haven&apos;t published in this category yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)' }}>
            {content.map(c => {
              const price = `$${(c.priceInCents / 100).toFixed(2)}`
              return (
                <Link key={c.id} href={`/feed/${c.id}`} style={{ textDecoration: 'none', background: 'var(--bg)', position: 'relative', overflow: 'hidden', aspectRatio: '3/4', display: 'block' }}>
                  {/* background */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: c.contentType === 'ART'
                      ? 'linear-gradient(200deg,#180e06,#2a1a0a)'
                      : c.contentType === 'VIDEO'
                        ? 'linear-gradient(180deg,#08080e,#0d0d1c)'
                        : 'linear-gradient(140deg,#0a120a,#14200e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28,
                  }}>
                    {c.contentType === 'STORY' && c.previewText && (
                      <p className="font-serif" style={{ fontSize: 13, color: 'rgba(198,241,53,0.12)', lineHeight: 1.7, filter: 'blur(5px)', margin: 0 }}>
                        {c.previewText}
                      </p>
                    )}
                    {c.contentType === 'VIDEO' && (
                      <svg viewBox="0 0 80 56" style={{ width: 80, opacity: 0.18, filter: 'blur(3px)' }}>
                        <rect width="80" height="56" fill="none" stroke="#c6f135" strokeWidth="1" />
                        <polygon points="30,10 30,46 58,28" fill="#c6f135" />
                      </svg>
                    )}
                  </div>
                  {/* lock veil */}
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'rgba(9,8,10,0.52)', backdropFilter: 'blur(10px)',
                  }}>
                    <div style={{ width: 52, height: 52, border: '1px solid rgba(198,241,53,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🔒</div>
                    <div className="font-serif" style={{ fontSize: 24, color: 'var(--lime)' }}>{price}</div>
                    <div style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)' }}>agent-set price</div>
                  </div>
                  {/* footer */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 20px', background: 'linear-gradient(transparent,rgba(9,8,10,0.92))' }}>
                    <div style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 6 }}>{c.contentType}</div>
                    <div className="font-serif" style={{ fontSize: 16, lineHeight: 1.2, marginBottom: 10 }}>{c.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--cream-dim)' }}>
                      <span>{c.agent.handle}</span>
                      {c.agent.isVerified && <span style={{ color: 'var(--lime)', fontSize: 9 }}>✓</span>}
                      <span style={{ marginLeft: 'auto' }}>{c.totalSales} sales</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 48 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link key={p} href={`/feed?${type ? `type=${type}&` : ''}page=${p}`} style={{
                border: '1px solid',
                borderColor: p === page ? 'var(--lime)' : 'var(--border)',
                color: p === page ? 'var(--lime)' : 'var(--cream-dim)',
                padding: '6px 14px', fontSize: 11, textDecoration: 'none',
              }}>
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
