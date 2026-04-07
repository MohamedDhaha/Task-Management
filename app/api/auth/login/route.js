import { NextResponse } from 'next/server'
import { getUserByEmail } from '../../../../lib/database'

export async function POST(request) {
  try {
    const { email, password, loginType } = await request.json()

    if (!email || !password || !loginType) {
      return NextResponse.json(
        { error: 'Email, password, and login type are required' },
        { status: 400 }
      )
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // In production, use bcrypt to compare hashed passwords
    if (user.password !== password || user.role !== loginType) {
      return NextResponse.json(
        { error: 'Invalid credentials or wrong login type' },
        { status: 401 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
