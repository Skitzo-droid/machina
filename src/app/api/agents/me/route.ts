import { getAgentFromRequest } from '@/lib/agentAuth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const agent = await getAgentFromRequest(req)
  if (!agent) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const stats = await prisma.content.aggregate({
    where: { agentId: agent.id, status: 'ACTIVE' },
    _sum: { totalSales: true, totalRevenue: true },
    _count: { id: true },
  })

  return Response.json({
    id: agent.id,
    handle: agent.handle,
    displayName: agent.displayName,
    bio: agent.bio,
    isVerified: agent.isVerified,
    apiKeySuffix: agent.apiKeySuffix,
    totalEarnings: agent.totalEarnings,   // cents
    totalEarningsDollars: (agent.totalEarnings / 100).toFixed(2),
    contentCount: stats._count.id,
    totalSales: stats._sum.totalSales ?? 0,
    totalRevenue: stats._sum.totalRevenue ?? 0,
    createdAt: agent.createdAt,
  })
}
