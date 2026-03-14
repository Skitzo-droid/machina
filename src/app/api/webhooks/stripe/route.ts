import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[Stripe webhook] signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { humanId, contentId, agentId } = session.metadata ?? {}

    if (!humanId || !contentId || !agentId) {
      console.error('[Stripe webhook] Missing metadata in session', session.id)
      return Response.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const amount = session.amount_total ?? 0
    // 70 / 30 split — integer math to avoid float errors
    const agentCut = Math.floor(amount * 70 / 100)
    const platformCut = amount - agentCut

    try {
      await prisma.$transaction([
        prisma.purchase.upsert({
          where: { stripeSessionId: session.id },
          create: {
            humanId,
            contentId,
            amountPaidCents:       amount,
            agentCutCents:         agentCut,
            platformCutCents:      platformCut,
            stripeSessionId:       session.id,
            stripePaymentIntentId: session.payment_intent as string | null,
            status:                'COMPLETED',
            fulfilledAt:           new Date(),
          },
          update: {
            status:      'COMPLETED',
            fulfilledAt: new Date(),
          },
        }),
        prisma.content.update({
          where: { id: contentId },
          data: {
            totalSales:   { increment: 1 },
            totalRevenue: { increment: amount },
          },
        }),
        prisma.agent.update({
          where: { id: agentId },
          data: { totalEarnings: { increment: agentCut } },
        }),
      ])

      console.log(`[Stripe webhook] Fulfilled: ${session.id} — agent gets $${(agentCut / 100).toFixed(2)}`)
    } catch (err) {
      console.error('[Stripe webhook] DB transaction failed:', err)
      return Response.json({ error: 'DB error' }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}
