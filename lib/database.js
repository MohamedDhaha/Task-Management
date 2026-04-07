import clientPromise from './mongodb'

let client
let db
let users
let tasks

async function init() {
  if (db) return
  try {
    client = await clientPromise
    db = client.db('taskflow')
    users = db.collection('users')
    tasks = db.collection('tasks')
    
    // Create indexes for better performance
    await users.createIndex({ email: 1 }, { unique: true })
    await tasks.createIndex({ userId: 1 })
    await tasks.createIndex({ status: 1 })
    
    // Initialize demo data if collections are empty
    const userCount = await users.countDocuments()
    if (userCount === 0) {
      await initializeDemoData()
    }
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

async function initializeDemoData() {
  const demoUsers = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123', // In production, hash this password
      role: 'user',
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'user123', // In production, hash this password
      role: 'user',
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // In production, hash this password
      role: 'admin',
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  try {
    await users.insertMany(demoUsers)
    console.log('Demo users initialized')
  } catch (error) {
    console.error('Error initializing demo data:', error)
  }
}

// User operations
export async function getUsers() {
  await init()
  return await users.find({ role: 'user' }).toArray()
}

export async function getUserById(id) {
  await init()
  return await users.findOne({ _id: id })
}

export async function getUserByEmail(email) {
  await init()
  return await users.findOne({ email })
}

export async function createUser(userData) {
  await init()
  const user = {
    ...userData,
    registrationDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const result = await users.insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function updateUser(id, userData) {
  await init()
  const result = await users.updateOne(
    { _id: id },
    { $set: { ...userData, updatedAt: new Date() } }
  )
  return result
}

// Task operations
export async function getTasks() {
  await init()
  return await tasks.find({}).toArray()
}

export async function getTasksByUserId(userId) {
  await init()
  return await tasks.find({ userId }).toArray()
}

export async function createTask(taskData) {
  await init()
  const task = {
    ...taskData,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const result = await tasks.insertOne(task)
  return { ...task, _id: result.insertedId }
}

export async function updateTask(id, taskData) {
  await init()
  const result = await tasks.updateOne(
    { _id: id },
    { $set: { ...taskData, updatedAt: new Date() } }
  )
  return result
}

export async function deleteTask(id) {
  await init()
  return await tasks.deleteOne({ _id: id })
}

// Statistics
export async function getTaskStats() {
  await init()
  const totalTasks = await tasks.countDocuments()
  const completedTasks = await tasks.countDocuments({ status: 'completed' })
  const pendingTasks = await tasks.countDocuments({ status: { $ne: 'completed' } })
  const totalUsers = await users.countDocuments({ role: 'user' })
  
  return {
    totalUsers,
    totalTasks,
    completedTasks,
    pendingTasks
  }
}

export async function getUserTaskStats(userId) {
  await init()
  const totalTasks = await tasks.countDocuments({ userId })
  const completedTasks = await tasks.countDocuments({ userId, status: 'completed' })
  const pendingTasks = await tasks.countDocuments({ userId, status: { $ne: 'completed' } })
  const overdueTasks = await tasks.countDocuments({
    userId,
    status: { $ne: 'completed' },
    deadline: { $lt: new Date() }
  })
  
  return {
    total: totalTasks,
    completed: completedTasks,
    pending: pendingTasks,
    overdue: overdueTasks
  }
}
