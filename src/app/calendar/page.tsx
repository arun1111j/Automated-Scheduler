
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Calendar, dateFnsLocalizer, Event, Views, View } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import axios from 'axios'
import toast from 'react-hot-toast'
import EditTaskModal from '@/components/EditTaskModal'
import CreateTaskModal from '@/components/CreateTaskModal'
import CustomToolbar from '@/components/CustomToolbar'
import { Task } from '@prisma/client'
import { formatTimeRemaining } from '@/lib/utils'

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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [loading, setLoading] = useState(true)

    // Controlled state for calendar
    const [view, setView] = useState<View>(Views.MONTH)
    const [date, setDate] = useState(new Date())

    const onNavigate = useCallback((newDate: Date) => setDate(newDate), [])
    const onView = useCallback((newView: View) => setView(newView), [])

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/v1/tasks')
            const tasks = res.data
            const mappedEvents = tasks
                .filter((task: any) => task.dueDate)
                .map((task: any) => ({
                    id: task.id,
                    title: `${task.title} (${formatTimeRemaining(task.dueDate)})`,
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

    const handleSelectEvent = (event: any) => {
        if (event.resource) {
            setSelectedTask(event.resource)
            setIsEditModalOpen(true)
        }
    }

    const handleSelectSlot = ({ start }: { start: Date }) => {
        setSelectedDate(start)
        setIsCreateModalOpen(true)
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
                            // Controlled props
                            date={date}
                            view={view}
                            onNavigate={onNavigate}
                            onView={onView}
                            // Accessors
                            startAccessor={(event: any) => new Date(event.start)}
                            endAccessor={(event: any) => new Date(event.end)}
                            draggableAccessor={(event: any) => true}
                            onEventDrop={onEventDrop}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            selectable
                            longPressThreshold={10}
                            resizable={false}
                            views={['month', 'week', 'day', 'agenda']}
                            components={{
                                toolbar: CustomToolbar,
                            }}
                            className="text-gray-900 dark:text-gray-200"
                        />
                    </div>
                </main>
            </div>

            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onTaskUpdated={fetchTasks}
                task={selectedTask}
            />

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onTaskCreated={fetchTasks}
                initialDate={selectedDate}
            />
        </div>
    )
}
