
'use client'

import { useState } from 'react'
import axios from 'axios'
import { AlertTriangle, X, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface BulkDeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    selectedCount: number
    ids: string[]
}

export default function BulkDeleteModal({ isOpen, onClose, onSuccess, selectedCount, ids }: BulkDeleteModalProps) {
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleDelete = async (type: 'selected' | 'completed' | 'in_progress' | 'all') => {
        if (type === 'all' || type === 'selected') {
            if (!confirm(`Are you sure you want to delete ${type === 'selected' ? 'the selected' : 'ALL'} tasks? This cannot be undone.`)) return
        }

        setLoading(true)
        try {
            let payload: any = {}
            if (type === 'selected') {
                payload.ids = ids
            } else if (type === 'completed') {
                payload.status = 'COMPLETED'
            } else if (type === 'in_progress') {
                payload.status = 'IN_PROGRESS'
            } else if (type === 'all') {
                payload.all = true
            }

            const res = await axios.delete('/api/v1/tasks', { data: payload })
            toast.success(`Deleted ${res.data.count} tasks`)
            onSuccess()
            onClose()
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete tasks')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-fade-in relative overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Delete Tasks
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleDelete('selected')}
                            disabled={loading || selectedCount === 0}
                            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 dark:text-white">Delete Selected</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Remove {selectedCount} selected tasks
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleDelete('completed')}
                            disabled={loading}
                            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 dark:text-white">Delete All Completed</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Clear finished tasks
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleDelete('in_progress')}
                            disabled={loading}
                            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 dark:text-white">Delete All In Progress</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Clear active tasks
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleDelete('all')}
                            disabled={loading}
                            className="w-full flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-red-700 dark:text-red-400">Delete EVERYTHING</p>
                                    <p className="text-xs text-red-600/70 dark:text-red-400/70">
                                        Danger Zone: Wipes all tasks
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
