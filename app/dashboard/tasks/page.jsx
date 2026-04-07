'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { CheckCircleIcon, ClockIcon, FlagIcon } from '@heroicons/react/24/outline'

export default function UserTasks() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    setUser(currentUser)
    
    if (currentUser._id) {
      fetchUserTasks(currentUser._id)
    }
  }, [])

  const fetchUserTasks = async (userId) => {
    try {
      const response = await fetch(`/api/tasks/user/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching user tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskComplete = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      })

      if (response.ok) {
        // Refresh tasks
        if (user._id) {
          fetchUserTasks(user._id)
        }
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'pending') return task.status !== 'completed'
    if (filter === 'completed') return task.status === 'completed'
    return true
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { bg: 'bg-gray-100', text: 'text-gray-800' },
      medium: { bg: 'bg-orange-100', text: 'text-orange-800' },
      high: { bg: 'bg-red-100', text: 'text-red-800' }
    }
    
    const config = priorityConfig[priority] || priorityConfig.medium
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  const isOverdue = (deadline, status) => {
    return status !== 'completed' && new Date(deadline) < new Date()
  }

  if (loading) {
    return (
      <DashboardLayout requiredRole="user">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="user">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-2">Manage and track your assigned tasks.</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Tasks', count: tasks.length },
              { key: 'pending', label: 'Pending', count: tasks.filter(t => t.status !== 'completed').length },
              { key: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{task.taskName}</h3>
                    {isOverdue(task.deadline, task.status) && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Overdue
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{task.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <FlagIcon className="h-4 w-4 mr-1" />
                      {getPriorityBadge(task.priority)}
                    </div>
                    <div>
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  {task.status !== 'completed' ? (
                    <button
                      onClick={() => handleTaskComplete(task._id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Mark Complete
                    </button>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filter === 'all' ? 'No tasks assigned' : `No ${filter} tasks`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "You don't have any tasks assigned yet." 
                : `You don't have any ${filter} tasks.`
              }
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
