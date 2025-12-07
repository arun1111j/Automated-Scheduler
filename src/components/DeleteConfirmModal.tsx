'use client'

import { useState } from 'react'
import axios from 'axios'
import { AlertTriangle, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onTaskDeleted: () => void
    task: {
        id: string
        title: string
    } | null
}

export default function DeleteConfirmModal({ isOpen, onClose, onTaskDeleted, task }: DeleteConfirmModalProps) {
    const [loading, setLoading] = useState(false)

    if (!isOpen || !task) return null

    const handleDelete = async () => {
        setLoading(true)

        try {
            await axios.delete(`/api/v1/tasks/${task.id}`)
            toast.success('Task deleted successfully')
            onTaskDeleted()
            onClose()
        } catch (error) {
            console.error('Failed to delete task:', error)
            toast.error('Failed to delete task')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-fade-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Task</h2>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Are you sure you want to delete this task?
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {task.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                        This action cannot be undone.
                    </p>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Deleting...' : 'Delete Task'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
