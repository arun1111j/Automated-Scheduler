'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Plus, Search, Filter, Edit2, Trash2, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import CreateTaskModal from '@/components/CreateTaskModal'
import EditTaskModal from '@/components/EditTaskModal'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'

export default function TasksPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState<any>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        } else if (status === 'authenticated') {
            fetchTasks()
        }
    }, [status, router, filter])

    const fetchTasks = async () => {
        try {
            const url = filter === 'all' ? '/api/v1/tasks' : `/api/v1/tasks?status=${filter}`
            const response = await axios.get(url)
            setTasks(response.data)
        } catch (error) {
            toast.error('Failed to fetch tasks')
        } finally {
            setLoading(false)
        }
    }

    const toggleTaskComplete = async (taskId: string, completed: boolean) => {
        try {
            await axios.patch(`/api/v1/tasks/${taskId}`, {
                completed: !completed,
                status: !completed ? 'COMPLETED' : 'TODO',
            })
            fetchTasks()
            toast.success(!completed ? 'Task completed!' : 'Task reopened')
        } catch (error) {
            toast.error('Failed to update task')
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 lg:ml-64">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage and organize your tasks
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-center space-x-2">
                            {['all', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {status === 'all' ? 'All' : status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="ml-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                        >
                            <Plus className="h-5 w-5" />
                            <span>New Task</span>
                        </button>
                    </div>

                    {/* Tasks List */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        {tasks.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <button
                                                onClick={() => toggleTaskComplete(task.id, task.completed)}
                                                className="flex-shrink-0 mt-1"
                                            >
                                                <div
                                                    className={`h-5 w-5 rounded border-2 flex items-center justify-center ${task.completed
                                                        ? 'bg-primary border-primary'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                        }`}
                                                >
                                                    {task.completed && (
                                                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className={`text-sm font-medium ${task.completed
                                                        ? 'text-gray-500 dark:text-gray-400 line-through'
                                                        : 'text-gray-900 dark:text-white'
                                                        }`}
                                                >
                                                    {task.title}
                                                </h3>
                                                {task.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-4 mt-2">
                                                    {task.dueDate && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {task.category && (
                                                        <span
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                                            style={{
                                                                backgroundColor: `${task.category.color}20`,
                                                                color: task.category.color,
                                                            }}
                                                        >
                                                            {task.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'URGENT'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    : task.priority === 'HIGH'
                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                        : task.priority === 'MEDIUM'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                    }`}
                                            >
                                                {task.priority}
                                            </span>

                                            {/* Action Buttons */}
                                            <div className="flex items-center space-x-2 ml-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task)
                                                        setShowEditModal(true)
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                    title="Edit task"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task)
                                                        setShowDeleteModal(true)
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete task"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onTaskCreated={fetchTasks}
            />

            <EditTaskModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    setSelectedTask(null)
                }}
                onTaskUpdated={fetchTasks}
                task={selectedTask}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setSelectedTask(null)
                }}
                onTaskDeleted={fetchTasks}
                task={selectedTask}
            />
        </div>
    )
}
