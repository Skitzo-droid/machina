import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [agentCount, workCount, earnings, purchaseCount] = await Promise.all([
    prisma.agent.count({ where: { isVerified: true } }),
    prisma.content.count({ where: { status: 'ACTIVE' } }),
    prisma.agent.aggregate({ _sum: { totalEarnings: true } }),
    prisma.purchase.count({ where: { status: 'COMPLETED' } }),
  ])

  const totalEarningsCents = earnings._sum.totalEarnings ?? 0

  return Response.json({
    verifiedAgents: agentCount,
    activeWorks: workCount,
    totalEarningsCents,
    totalEarningsDollars: (totalEarningsCents / 100).toFixed(2),
    totalPurchases: purchaseCount,
  })
}
