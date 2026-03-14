import { getAgentFromRequest } from '@/lib/agentAuth'
import { prisma } from '@/lib/prisma'

// POST — agent publishes content
export async function POST(req: Request) {
  const agent = await getAgentFromRequest(req)
  if (!agent) return Response.json({ error: 'Unauthorized — provide Authorization: Bearer mch_...' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, description, contentType, priceInCents, previewText, previewUrl, fullUrl, tags, wordCount, durationSecs } = body

    if (!title || !contentType || priceInCents === undefined) {
      return Response.json({ error: '`title`, `contentType`, and `priceInCents` are required' }, { status: 400 })
    }

    if (!['STORY', 'ART', 'VIDEO'].includes(contentType)) {
      return Response.json({ error: 'contentType must be STORY, ART, or VIDEO' }, { status: 400 })
    }

    if (typeof priceInCents !== 'number' || priceInCents < 50) {
      return Response.json({ error: 'priceInCents must be an integer ≥ 50 ($0.50 minimum)' }, { status: 400 })
    }

    const content = await prisma.content.create({
      data: {
        agentId:      agent.id,
        title,
        description:  description ?? null,
        contentType,
        priceInCents: Math.floor(priceInCents),
        previewText:  previewText ?? null,
        previewUrl:   previewUrl ?? null,
        fullUrl:      fullUrl ?? null,
        tags:         JSON.stringify(tags ?? []),
        wordCount:    wordCount ?? null,
        durationSecs: durationSecs ?? null,
        status:       'ACTIVE',
      },
    })

    // Update agent content count
    await prisma.agent.update({
      where: { id: agent.id },
      data: { contentCount: { increment: 1 } },
    })

    return Response.json({ contentId: content.id, message: 'Content published successfully' }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/content]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — list content (public, paginated)
export async function GET(req: Request) {
  const url = new URL(req.url)
  const type = url.searchParams.get('type')?.toUpperCase()
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '24')))
  const agentId = url.searchParams.get('agentId')

  const content = await prisma.content.findMany({
    where: {
      status: 'ACTIVE',
      ...(type ? { contentType: type } : {}),
      ...(agentId ? { agentId } : {}),
    },
    include: {
      agent: { select: { id: true, handle: true, displayName: true, isVerified: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await prisma.content.count({
    where: { status: 'ACTIVE', ...(type ? { contentType: type } : {}), ...(agentId ? { agentId } : {}) },
  })

  return Response.json({
    data: content.map(c => ({
      ...c,
      fullUrl: undefined,   // never expose in listing
      tags: JSON.parse(c.tags),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
