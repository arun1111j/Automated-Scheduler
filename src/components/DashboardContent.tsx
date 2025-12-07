'use client'

import { useEffect, useState } from 'react'
import GoogleSheetsImportModal from '@/components/GoogleSheetsImportModal'
import axios from 'axios'
import { CheckSquare, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { formatDuration, formatTimeRemaining } from '@/lib/utils'

export default function DashboardContent() {
    const [isImportOpen, setImportOpen] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null)
    const [tasks, setTasks] = useState<any[]>([])
    const [schedules, setSchedules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [analyticsRes, tasksRes, schedulesRes] = await Promise.all([
                axios.get('/api/v1/analytics'),
                axios.get('/api/v1/tasks?status=TODO'),
                axios.get('/api/v1/schedules'),
            ])

            setAnalytics(analyticsRes.data)
            setTasks(tasksRes.data.slice(0, 5))
            setSchedules(schedulesRes.data.slice(0, 5))
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="lg:ml-64">
            <button onClick={() => setImportOpen(true)} className="mb-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">Import Google Sheet</button>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Welcome back! Here's what's happening today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Tasks"
                    value={analytics?.taskStats?.total || 0}
                    icon={<CheckSquare className="h-6 w-6" />}
                    color="blue"
                />
                <StatCard
                    title="Completed"
                    value={analytics?.taskStats?.completed || 0}
                    icon={<CheckSquare className="h-6 w-6" />}
                    color="green"
                />

                <StatCard
                    title="Upcoming Events"
                    value={analytics?.upcomingEvents || 0}
                    icon={<Calendar className="h-6 w-6" />}
                    color="orange"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Tasks */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
                        <a href="/tasks" className="text-primary hover:text-primary/90 text-sm font-medium">
                            View all
                        </a>
                    </div>
                    {tasks.length > 0 ? (
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {task.title}
                                        </p>
                                        {task.dueDate && (
                                            <div className="mt-1 flex items-center space-x-2">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </p>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${formatTimeRemaining(task.dueDate).includes('Overdue')
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                    }`}>
                                                    {formatTimeRemaining(task.dueDate)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'URGENT'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            : task.priority === 'HIGH'
                                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                            }`}
                                    >
                                        {task.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No pending tasks</p>
                    )}
                </div>

                {/* Upcoming Events */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
                        <a href="/calendar" className="text-primary hover:text-primary/90 text-sm font-medium">
                            View calendar
                        </a>
                    </div>
                    {schedules.length > 0 ? (
                        <div className="space-y-3">
                            {schedules.map((schedule) => (
                                <div
                                    key={schedule.id}
                                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {schedule.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(schedule.startTime).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No upcoming events</p>
                    )}
                </div>
            </div>

            {/* Progress Section */}
            {analytics && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Task Completion Rate
                                </span>
                                <span className="text-sm font-semibold text-primary">
                                    {analytics.completionRate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${analytics.completionRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <GoogleSheetsImportModal isOpen={isImportOpen} onClose={() => setImportOpen(false)} onSuccess={fetchData} />
        </div>
    )
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
}) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
