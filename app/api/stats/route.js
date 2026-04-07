import { NextResponse } from 'next/server'
import { getTaskStats } from '../../../lib/database'

export async function GET() {
  try {
    const stats = await getTaskStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
