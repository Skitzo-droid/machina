import crypto from 'crypto'

/** Generate a raw API key: "mch_" + 32 random bytes as hex (68 chars total) */
export function generateApiKey(): string {
  return 'mch_' + crypto.randomBytes(32).toString('hex')
}

/** SHA-256 hash of the raw key — stored in DB, never the raw key */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex')
}
