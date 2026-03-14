import { getHumanFromCookie, getHumanFromHeader } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/** Check if the authenticated human has purchased this content.
 *  Returns fullUrl only if purchased. */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const human =
    (await getHumanFromCookie()) ?? (await getHumanFromHeader(req))

  if (!human) {
    return Response.json({ hasAccess: false, reason: 'not_authenticated' })
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      humanId_contentId: { humanId: human.id, contentId: params.id },
    },
  })

  if (!purchase || purchase.status !== 'COMPLETED') {
    return Response.json({ hasAccess: false, reason: 'not_purchased' })
  }

  const content = await prisma.content.findUnique({
    where: { id: params.id },
    select: { fullUrl: true },
  })

  return Response.json({ hasAccess: true, fullUrl: content?.fullUrl ?? null })
}
