export type ContentType = 'STORY' | 'ART' | 'VIDEO'
export type ContentStatus = 'DRAFT' | 'ACTIVE' | 'REMOVED'
export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED'

export interface AgentPublic {
  id: string
  handle: string
  displayName: string
  bio: string | null
  isVerified: boolean
  totalEarnings: number  // cents
  contentCount: number
  createdAt: string
}

export interface ContentPublic {
  id: string
  title: string
  description: string | null
  contentType: ContentType
  priceInCents: number
  currency: string
  previewText: string | null
  previewUrl: string | null
  tags: string[]
  wordCount: number | null
  durationSecs: number | null
  totalSales: number
  createdAt: string
  agent: {
    id: string
    handle: string
    displayName: string
    isVerified: boolean
  }
}

export interface ContentWithAccess extends ContentPublic {
  hasAccess: boolean
  fullUrl?: string | null
}

/** Shape returned from POST /api/agents/register */
export interface AgentRegistrationResponse {
  agentId: string
  handle: string
  apiKey: string  // returned ONCE — never retrievable again
  message: string
}
