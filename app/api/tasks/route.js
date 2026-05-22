import { NextResponse } from 'next/server'
import { getTasks, createTask } from '../../../lib/database'

/**
 * GET handler for /api/tasks
 * Retrieves a list of all tasks from the database.
 */
export async function GET() {
  try {
    console.debug('[API] GET /api/tasks - Fetching all tasks');
    const tasks = await getTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('[API Error] Failed to fetch tasks in GET /api/tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

/**
 * POST handler for /api/tasks
 * Creates a new task and saves it to the database.
 */
export async function POST(request) {
  try {
    const taskData = await request.json()
    console.debug('[API] POST /api/tasks - Payload received for task:', taskData.taskName);
    
    // Validate required fields
    if (!taskData.userId || !taskData.taskName || !taskData.description || !taskData.deadline) {
      console.warn('[API Warning] POST /api/tasks - Missing required fields in payload');
      return NextResponse.json(
        { error: 'UserId, taskName, description, and deadline are required' },
        { status: 400 }
      )
    }

    const task = await createTask({
      ...taskData,
      _id: Date.now().toString() // Simple ID generation
    })
    
    console.log(`[API] POST /api/tasks - Task created successfully with ID: ${task._id}`);
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('[API Error] Failed to create task in POST /api/tasks:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
