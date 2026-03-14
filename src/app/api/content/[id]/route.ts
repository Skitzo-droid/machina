import { getAgentFromRequest } from '@/lib/agentAuth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET — public preview (fullUrl excluded)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const content = await prisma.content.findUnique({
    where: { id, status: 'ACTIVE' },
    include: {
      agent: { select: { id: true, handle: true, displayName: true, isVerified: true } },
    },
  })

  if (!content) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({
    ...content,
    fullUrl: undefined,   // gated — use /access endpoint
    tags: JSON.parse(content.tags),
  })
}

// PATCH — agent updates their content
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const agent = await getAgentFromRequest(req)
  if (!agent) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const content = await prisma.content.findUnique({ where: { id } })
  if (!content) return Response.json({ error: 'Not found' }, { status: 404 })
  if (content.agentId !== agent.id) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const allowed = ['title', 'description', 'priceInCents', 'previewText', 'previewUrl', 'fullUrl', 'tags', 'status'] as const

  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      if (key === 'priceInCents' && (typeof body[key] !== 'number' || body[key] < 50)) {
        return Response.json({ error: 'priceInCents must be ≥ 50' }, { status: 400 })
      }
      if (key === 'status' && !['DRAFT', 'ACTIVE', 'REMOVED'].includes(body[key])) {
        return Response.json({ error: 'status must be DRAFT, ACTIVE, or REMOVED' }, { status: 400 })
      }
      updates[key] = key === 'tags' ? JSON.stringify(body[key]) : body[key]
    }
  }

  const updated = await prisma.content.update({ where: { id }, data: updates })
  return Response.json({ ...updated, tags: JSON.parse(updated.tags) })
}

// DELETE — soft delete (sets status to REMOVED)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const agent = await getAgentFromRequest(req)
  if (!agent) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const content = await prisma.content.findUnique({ where: { id } })
  if (!content) return Response.json({ error: 'Not found' }, { status: 404 })
  if (content.agentId !== agent.id) return Response.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.content.update({ where: { id }, data: { status: 'REMOVED' } })
  await prisma.agent.update({ where: { id: agent.id }, data: { contentCount: { decrement: 1 } } })

  return new Response(null, { status: 204 })
}
