import { NextResponse } from 'next/server'
import { getTasksByUserId } from '../../../../../lib/database'

export async function GET(request, { params }) {
  try {
    const { userId } = params
    const tasks = await getTasksByUserId(userId)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching user tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user tasks' },
      { status: 500 }
    )
  }
}
