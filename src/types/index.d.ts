// This file defines TypeScript types and interfaces used throughout the application.

import { DefaultSession } from 'next-auth'

// Extend NextAuth types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string
        } & DefaultSession['user']
    }
}

// Enums
export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum RecurrenceType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

export enum NotificationType {
    TASK_DUE = 'TASK_DUE',
    EVENT_REMINDER = 'EVENT_REMINDER',
    TASK_ASSIGNED = 'TASK_ASSIGNED',
    TASK_COMPLETED = 'TASK_COMPLETED',
    GENERAL = 'GENERAL',
}

// Models
export interface User {
    id: string
    name: string | null
    email: string
    image?: string | null
    emailVerified?: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface Category {
    id: string
    name: string
    color: string
    userId: string
    createdAt: Date
    updatedAt: Date
}

export interface Tag {
    id: string
    name: string
    createdAt: Date
}

export interface Schedule {
    id: string
    title: string
    description?: string | null
    startTime: Date
    endTime: Date
    allDay: boolean
    location?: string | null
    userId: string
    categoryId?: string | null
    isRecurring: boolean
    recurrenceType?: RecurrenceType | null
    recurrenceEnd?: Date | null
    createdAt: Date
    updatedAt: Date
    category?: Category | null
}

export interface Task {
    id: string
    title: string
    description?: string | null
    dueDate?: Date | null
    priority: TaskPriority
    status: TaskStatus
    completed: boolean
    userId: string
    categoryId?: string | null
    position: number
    estimatedTime?: number | null
    createdAt: Date
    updatedAt: Date
    completedAt?: Date | null
    category?: Category | null
    tags?: Tag[]
}

export interface TimeEntry {
    id: string
    userId: string
    taskId?: string | null
    description?: string | null
    startTime: Date
    endTime?: Date | null
    duration?: number | null
    createdAt: Date
    updatedAt: Date
    task?: Task | null
}

export interface Notification {
    id: string
    userId: string
    type: NotificationType
    title: string
    message: string
    read: boolean
    createdAt: Date
}

export interface Reminder {
    id: string
    userId: string
    taskId?: string | null
    scheduleId?: string | null
    reminderTime: Date
    message: string
    sent: boolean
    createdAt: Date
}

// Analytics & Stats
export interface TaskStats {
    total: number
    completed: number
    inProgress: number
    todo: number
    overdue: number
}

export interface TimeStats {
    totalMinutes: number
    todayMinutes: number
    weekMinutes: number
    monthMinutes: number
}

export interface Progress {
    userId: string
    taskStats: TaskStats
    timeStats: TimeStats
    completionRate: number
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

// Calendar Event (for react-big-calendar)
export interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    allDay?: boolean
    resource?: Schedule
}