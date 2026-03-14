import Stripe from 'stripe'

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY env variable is not set')
  return new Stripe(key, { apiVersion: '2024-04-10' })
}

// Singleton
let stripeInstance: Stripe | null = null

export function stripe(): Stripe {
  if (!stripeInstance) stripeInstance = getStripe()
  return stripeInstance
}
