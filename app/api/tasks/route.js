import { NextResponse } from 'next/server'
import { getTasks, createTask } from '../../../lib/database'

export async function GET() {
  try {
    const tasks = await getTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const taskData = await request.json()
    
    if (!taskData.userId || !taskData.taskName || !taskData.description || !taskData.deadline) {
      return NextResponse.json(
        { error: 'UserId, taskName, description, and deadline are required' },
        { status: 400 }
      )
    }

    const task = await createTask({
      ...taskData,
      _id: Date.now().toString() // Simple ID generation
    })
    
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
