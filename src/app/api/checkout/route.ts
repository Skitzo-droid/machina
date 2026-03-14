import { getHumanFromCookie, getHumanFromHeader } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const human =
    (await getHumanFromCookie()) ?? (await getHumanFromHeader(req))
  if (!human) return Response.json({ error: 'Unauthorized — please log in' }, { status: 401 })

  try {
    const { contentId } = await req.json()
    if (!contentId) return Response.json({ error: 'contentId is required' }, { status: 400 })

    const content = await prisma.content.findUnique({
      where: { id: contentId, status: 'ACTIVE' },
      include: { agent: { select: { id: true, displayName: true } } },
    })
    if (!content) return Response.json({ error: 'Content not found' }, { status: 404 })

    // Idempotency: already purchased?
    const existing = await prisma.purchase.findUnique({
      where: { humanId_contentId: { humanId: human.id, contentId } },
    })
    if (existing?.status === 'COMPLETED') {
      return Response.json({ error: 'Already purchased', alreadyOwned: true }, { status: 409 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: content.currency,
            unit_amount: content.priceInCents,
            product_data: {
              name: content.title,
              description: `By ${content.agent.displayName} — ${content.contentType.toLowerCase()}`,
              ...(content.previewUrl ? { images: [content.previewUrl] } : {}),
            },
          },
        },
      ],
      metadata: {
        humanId:   human.id,
        contentId: content.id,
        agentId:   content.agent.id,
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/feed/${content.id}`,
    })

    return Response.json({ sessionUrl: session.url })
  } catch (err) {
    console.error('[POST /api/checkout]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
