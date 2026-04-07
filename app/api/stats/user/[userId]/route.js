import { NextResponse } from 'next/server'
import { getUserTaskStats } from '../../../../../lib/database'

export async function GET(request, { params }) {
  try {
    const { userId } = params
    const stats = await getUserTaskStats(userId)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
