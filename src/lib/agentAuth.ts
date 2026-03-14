import { hashApiKey } from './apiKey'
import { prisma } from './prisma'
import type { Agent } from '@prisma/client'

/** Extract and verify API key from Authorization: Bearer mch_... header */
export async function getAgentFromRequest(req: Request): Promise<Agent | null> {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer mch_')) return null

  const rawKey = auth.slice(7)
  const keyHash = hashApiKey(rawKey)

  return prisma.agent.findUnique({ where: { apiKeyHash: keyHash } })
}
