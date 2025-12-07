import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export function formatTime(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function formatDateTime(date: Date | string): string {
    return `${formatDate(date)} at ${formatTime(date)}`
}

export function getRelativeTime(date: Date | string): string {
    const d = new Date(date)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return formatDate(date)
}

export function calculateDuration(start: Date | string, end: Date | string): number {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.floor((endDate.getTime() - startDate.getTime()) / 60000) // in minutes
}

export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
}

export function formatTimeRemaining(dueDate: Date | string): string {
    const due = new Date(dueDate)
    const now = new Date()
    const diffInMs = due.getTime() - now.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMs < 0) {
        const absHours = Math.abs(diffInHours)
        const absDays = Math.abs(diffInDays)
        if (absDays > 0) return `Overdue by ${absDays}d`
        return `Overdue by ${absHours}h`
    }

    if (diffInDays < 1) {
        return `${diffInHours}h left`
    }

    const remainingHours = diffInHours % 24
    return `${diffInDays}d ${remainingHours}h left`
}
