import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_NAME } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return Response.json({ error: 'email and password are required' }, { status: 400 })
    }

    const human = await prisma.human.findUnique({ where: { email } })
    if (!human) return Response.json({ error: 'Invalid credentials' }, { status: 401 })

    const valid = await bcrypt.compare(password, human.passwordHash)
    if (!valid) return Response.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = await signToken({ sub: human.id, email: human.email })

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return Response.json({ id: human.id, email: human.email, displayName: human.displayName, token })
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return Response.json({ message: 'Logged out' })
}
