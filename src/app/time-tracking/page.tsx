'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import TimeTracker from '@/components/TimeTracker'
import axios from 'axios'
import { format } from 'date-fns'
import { Clock, History } from 'lucide-react'

export default function TimeTrackingPage() {
    const [entries, setEntries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchEntries = useCallback(async () => {
        try {
            const res = await axios.get('/api/v1/time-tracking')
            setEntries(res.data)
        } catch (error) {
            console.error('Failed to fetch time entries:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchEntries()
    }, [fetchEntries])

    // Group entries by date
    const groupedEntries = entries.reduce((acc: any, entry: any) => {
        const date = format(new Date(entry.startTime), 'yyyy-MM-dd')
        if (!acc[date]) acc[date] = []
        acc[date].push(entry)
        return acc
    }, {})

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return 'Running...'
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return `${h > 0 ? `${h}h ` : ''}${m}m`
    }

    const handleExport = () => {
        if (entries.length === 0) return

        const headers = ['Date', 'Task', 'Description', 'Start Time', 'End Time', 'Duration (min)']
        const csvContent = [
            headers.join(','),
            ...entries.map((entry) => {
                const taskTitle = entry.task?.title || ''
                const desc = entry.description || ''
                const start = format(new Date(entry.startTime), 'yyyy-MM-dd HH:mm:ss')
                const end = entry.endTime ? format(new Date(entry.endTime), 'yyyy-MM-dd HH:mm:ss') : ''
                const duration = entry.duration || ''

                // Escape quotes
                const row = [
                    format(new Date(entry.startTime), 'yyyy-MM-dd'),
                    `"${taskTitle.replace(/"/g, '""')}"`,
                    `"${desc.replace(/"/g, '""')}"`,
                    start,
                    end,
                    duration,
                ]
                return row.join(',')
            }),
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `time-report-${format(new Date(), 'yyyy-MM-dd')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 lg:ml-64">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Time Tracking</h1>
                        <button
                            onClick={handleExport}
                            disabled={entries.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Export CSV
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Timer</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Track your work in real-time</p>
                            </div>
                            <TimeTracker onTimerChange={fetchEntries} className="scale-110 origin-right" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                <History className="h-5 w-5 mr-2 text-gray-500" />
                                Recent Activity
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <div className="p-6 text-center text-gray-500">Loading entries...</div>
                            ) : entries.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No time entries found. Start tracking!</div>
                            ) : (
                                Object.keys(groupedEntries)
                                    .sort()
                                    .reverse()
                                    .map((date) => (
                                        <div key={date}>
                                            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                                            </div>
                                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {groupedEntries[date].map((entry: any) => (
                                                    <li key={entry.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-start">
                                                                <div className="flex-shrink-0 pt-1">
                                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <div className="ml-3">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {entry.task?.title || entry.description || 'No description'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {format(new Date(entry.startTime), 'h:mm a')} -{' '}
                                                                        {entry.endTime ? format(new Date(entry.endTime), 'h:mm a') : 'Now'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {formatDuration(entry.duration)}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
