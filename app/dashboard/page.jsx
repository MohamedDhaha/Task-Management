'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function UserDashboard() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  })
  const [loading, setLoading] = useState(true)

  // Load user data and fetch dashboard content on mount
  useEffect(() => {
    console.debug('[Dashboard] Component mounted, checking for logged-in user...');
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      setUser(currentUser)
      
      if (currentUser._id) {
        console.debug(`[Dashboard] Valid user found (${currentUser._id}). Fetching dashboard data...`);
        fetchUserTasks(currentUser._id)
        fetchUserStats(currentUser._id)
      } else {
        console.warn('[Dashboard Warning] No valid user found in localStorage');
      }
    } catch (error) {
      console.error('[Dashboard Error] Failed to parse user from localStorage:', error);
    }
  }, [])

  /**
   * Fetches the user's tasks from the API and updates state
   * @param {string} userId - The ID of the user to fetch tasks for
   */
  const fetchUserTasks = async (userId) => {
    try {
      console.debug(`[Dashboard] Fetching tasks for user: ${userId}`);
      const response = await fetch(`/api/tasks/user/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
        console.debug(`[Dashboard] Successfully loaded ${data.length} tasks`);
      } else {
        console.warn(`[Dashboard Warning] Failed to fetch tasks. Response status: ${response.status}`);
      }
    } catch (error) {
      console.error('[Dashboard Error] Exception fetching user tasks:', error)
    }
  }

  /**
   * Fetches the user's dashboard statistics from the API
   * @param {string} userId - The ID of the user to fetch stats for
   */
  const fetchUserStats = async (userId) => {
    try {
      console.debug(`[Dashboard] Fetching stats for user: ${userId}`);
      const response = await fetch(`/api/stats/user/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        console.debug('[Dashboard] Successfully loaded user stats');
      } else {
        console.warn(`[Dashboard Warning] Failed to fetch stats. Response status: ${response.status}`);
      }
    } catch (error) {
      console.error('[Dashboard Error] Exception fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Tasks',
      value: stats.total,
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Completed',
      value: stats.completed,
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Pending',
      value: stats.pending,
      icon: ClockIcon,
      color: 'bg-orange-500'
    },
    {
      name: 'Overdue',
      value: stats.overdue,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500'
    }
  ]

  const recentTasks = tasks.slice(0, 5)

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Here's an overview of your tasks and progress.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(({ name, value, icon: Icon, color }) => (
            <div key={name} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`${color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{name}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Task Completion</span>
                <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
              <a
                href="/dashboard/tasks"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all tasks
              </a>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentTasks.map((task) => (
              <div key={task._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{task.taskName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-500">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentTasks.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks assigned</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any tasks assigned yet.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
