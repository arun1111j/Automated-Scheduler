'use client'

import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Play, Square, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface TimeTrackerProps {
    taskId?: string
    className?: string
    compact?: boolean
    onTimerChange?: () => void
}

export default function TimeTracker({ taskId, className = '', compact = false, onTimerChange }: TimeTrackerProps) {
    const [activeEntry, setActiveEntry] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [elapsed, setElapsed] = useState(0)

    // Fetch active timer
    const fetchActiveTimer = useCallback(async () => {
        try {
            const res = await axios.get('/api/v1/time-tracking/active')
            setActiveEntry(res.data)
            if (res.data) {
                const start = new Date(res.data.startTime).getTime()
                const now = new Date().getTime()
                setElapsed(Math.floor((now - start) / 1000))
            } else {
                setElapsed(0)
            }
        } catch (error) {
            console.error('Failed to fetch active timer', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchActiveTimer()
    }, [fetchActiveTimer])

    // Update elapsed time every second
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (activeEntry) {
            interval = setInterval(() => {
                setElapsed((prev) => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [activeEntry])

    const startTimer = async () => {
        try {
            setLoading(true)
            await axios.post('/api/v1/time-tracking', {
                taskId,
                description: taskId ? undefined : 'General work',
            })
            toast.success('Timer started')
            await fetchActiveTimer()
            if (onTimerChange) onTimerChange()
        } catch (error: any) {
            // If error says timer already running, we could handle it. But toast serves well.
            toast.error(error.response?.data?.error || 'Failed to start timer')
        } finally {
            setLoading(false)
        }
    }

    const stopTimer = async () => {
        try {
            setLoading(true)
            await axios.post('/api/v1/time-tracking/stop')
            toast.success('Timer stopped')
            setActiveEntry(null)
            setElapsed(0)
            if (onTimerChange) onTimerChange()
        } catch (error) {
            toast.error('Failed to stop timer')
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`
    }

    if (loading && !activeEntry) {
        return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
    }

    // If taskId is provided, only show controls if:
    // 1. No active timer
    // 2. Active timer is FOR THIS task
    // 3. (Optional) Disable start if active timer is for ANOTHER task
    const isActiveForThisTask = activeEntry && activeEntry.taskId === taskId
    const isActiveForOtherTask = activeEntry && activeEntry.taskId !== taskId

    if (compact) {
        if (isActiveForThisTask) {
            return (
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        stopTimer()
                    }}
                    className={`p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 ${className}`}
                    title="Stop Timer"
                >
                    <Square className="h-4 w-4" />
                </button>
            )
        }
        return (
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    startTimer()
                }}
                disabled={!!activeEntry}
                className={`p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                title={activeEntry ? 'Timer running on another task' : 'Start Timer'}
            >
                <Play className="h-4 w-4" />
            </button>
        )
    }

    // Full view (for Time Tracking page or details)
    return (
        <div className={`flex items-center space-x-4 ${className}`}>
            {activeEntry ? (
                <>
                    <div className="text-sm font-medium text-primary tabular-nums">
                        {formatTime(elapsed)}
                    </div>
                    <div className="text-xs text-gray-500 max-w-[150px] truncate hidden sm:block">
                        {activeEntry.task?.title || activeEntry.description || 'No description'}
                    </div>
                    <button
                        onClick={stopTimer}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                    >
                        <Square className="h-4 w-4 mr-1.5" />
                        Stop
                    </button>
                </>
            ) : (
                <button
                    onClick={startTimer}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors"
                >
                    <Play className="h-4 w-4 mr-1.5" />
                    Start Timer
                </button>
            )}
        </div>
    )
}
