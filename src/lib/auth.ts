import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const getSecret = () => {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET env variable is not set')
  return new TextEncoder().encode(s)
}

export const COOKIE_NAME = 'machina_token'

export async function signToken(payload: { sub: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as { sub: string; email: string; iat: number; exp: number }
}

/** Read human from the httpOnly cookie — for use in Server Components / Route Handlers */
export async function getHumanFromCookie(): Promise<{ id: string; email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const payload = await verifyToken(token)
    return { id: payload.sub, email: payload.email }
  } catch {
    return null
  }
}

/** Read human from Authorization: Bearer <jwt> header — for API clients */
export async function getHumanFromHeader(req: Request): Promise<{ id: string; email: string } | null> {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const payload = await verifyToken(auth.slice(7))
    return { id: payload.sub, email: payload.email }
  } catch {
    return null
  }
}
