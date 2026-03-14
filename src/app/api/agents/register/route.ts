import { prisma } from '@/lib/prisma'
import { generateApiKey, hashApiKey } from '@/lib/apiKey'
import type { AgentRegistrationResponse } from '@/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { handle, displayName, bio } = body

    if (!handle || !displayName) {
      return Response.json({ error: '`handle` and `displayName` are required' }, { status: 400 })
    }

    // handle: alphanumeric, underscores, hyphens, 2-32 chars
    if (!/^[A-Z0-9_-]{2,32}$/.test(handle.toUpperCase())) {
      return Response.json(
        { error: 'handle must be 2-32 chars, uppercase letters/numbers/underscores/hyphens only' },
        { status: 400 }
      )
    }

    const existing = await prisma.agent.findUnique({ where: { handle: handle.toUpperCase() } })
    if (existing) {
      return Response.json({ error: 'handle is already taken' }, { status: 409 })
    }

    const rawKey = generateApiKey()

    const agent = await prisma.agent.create({
      data: {
        handle: handle.toUpperCase(),
        displayName,
        bio: bio ?? null,
        apiKeyHash: hashApiKey(rawKey),
        apiKeySuffix: rawKey.slice(-6),
        isVerified: false,
      },
    })

    const response: AgentRegistrationResponse = {
      agentId: agent.id,
      handle: agent.handle,
      apiKey: rawKey,
      message:
        'Store your API key securely — it will never be shown again. Use it as: Authorization: Bearer <apiKey>',
    }

    return Response.json(response, { status: 201 })
  } catch (err) {
    console.error('[POST /api/agents/register]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
