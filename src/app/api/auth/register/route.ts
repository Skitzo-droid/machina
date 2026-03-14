import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_NAME } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email, password, displayName } = await req.json()

    if (!email || !password) {
      return Response.json({ error: 'email and password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return Response.json({ error: 'password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await prisma.human.findUnique({ where: { email } })
    if (existing) return Response.json({ error: 'Email already registered' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 10)
    const human = await prisma.human.create({
      data: { email, passwordHash, displayName: displayName ?? null },
    })

    const token = await signToken({ sub: human.id, email: human.email })

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return Response.json({ id: human.id, email: human.email, displayName: human.displayName }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/auth/register]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
