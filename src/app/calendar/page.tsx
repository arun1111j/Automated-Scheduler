'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import axios from 'axios'
import toast from 'react-hot-toast'
import EditTaskModal from '@/components/EditTaskModal'
import { Task } from '@prisma/client' // Type definition might need adjustment if not available directly

import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const locales = {
    'en-US': enUS,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

const DnDCalendar = withDragAndDrop(Calendar)

interface CalendarEvent extends Event {
    id: string
    title: string
    start: Date
    end: Date
    allDay?: boolean
    resource?: any
}

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [selectedTask, setSelectedTask] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/v1/tasks')
            const tasks = res.data
            const mappedEvents = tasks
                .filter((task: any) => task.dueDate)
                .map((task: any) => ({
                    id: task.id,
                    title: task.title,
                    start: new Date(task.dueDate),
                    end: new Date(task.dueDate), // Default to same day for now
                    allDay: true,
                    resource: task,
                }))
            setEvents(mappedEvents)
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
            toast.error('Failed to load calendar events')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const onEventDrop = async ({ event, start, end }: any) => {
        try {
            const updatedEvent = { ...event, start, end }

            // Optimistic update
            setEvents((prev) =>
                prev.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev))
            )

            await axios.patch(`/api/v1/tasks/${event.id}`, {
                dueDate: start.toISOString(),
            })

            toast.success('Task rescheduled')
            fetchTasks() // Refresh to ensure satisfying server state
        } catch (error) {
            console.error('Failed to update task date:', error)
            toast.error('Failed to reschedule task')
            fetchTasks() // Revert on error
        }
    }

    const handleSelectEvent = (event: CalendarEvent) => {
        if (event.resource) {
            setSelectedTask(event.resource)
            setIsModalOpen(true)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 lg:ml-64">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Calendar</h1>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-[calc(100vh-200px)]">
                        <DnDCalendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            draggableAccessor={(event) => true}
                            onEventDrop={onEventDrop}
                            onSelectEvent={handleSelectEvent}
                            resizable={false} // Task due dates usually don't have end times in this app yet
                            defaultView="month"
                            views={['month', 'week', 'day', 'agenda']}
                            className="text-gray-900 dark:text-gray-200"
                        />
                    </div>
                </main>
            </div>

            <EditTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTaskUpdated={fetchTasks}
                task={selectedTask}
            />
        </div>
    )
}
