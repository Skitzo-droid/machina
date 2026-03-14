import { getHumanFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const human = await getHumanFromCookie()
  if (!human) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const humanData = await prisma.human.findUnique({
    where: { id: human.id },
    select: { id: true, email: true, displayName: true, createdAt: true },
  })

  if (!humanData) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  return Response.json({
    id: humanData.id,
    email: humanData.email,
    displayName: humanData.displayName,
    createdAt: humanData.createdAt,
  })
}
