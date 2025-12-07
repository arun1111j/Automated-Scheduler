import { z } from 'zod'

export const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional().or(z.date().optional()),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('TODO'),
    categoryId: z.string().optional(),
    estimatedTime: z.number().int().positive().optional(),
    completed: z.boolean().default(false),
})

export const scheduleSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    startTime: z.string().datetime().or(z.date()),
    endTime: z.string().datetime().or(z.date()),
    allDay: z.boolean().default(false),
    location: z.string().optional(),
    categoryId: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurrenceType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    recurrenceEnd: z.string().datetime().optional().or(z.date().optional()),
})

export const timeEntrySchema = z.object({
    taskId: z.string().optional(),
    description: z.string().optional(),
    startTime: z.string().datetime().or(z.date()),
    endTime: z.string().datetime().optional().or(z.date().optional()),
})

export const categorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
})

export const reminderSchema = z.object({
    taskId: z.string().optional(),
    scheduleId: z.string().optional(),
    reminderTime: z.string().datetime().or(z.date()),
    message: z.string().min(1, 'Message is required'),
})

export type TaskInput = z.infer<typeof taskSchema>
export type ScheduleInput = z.infer<typeof scheduleSchema>
export type TimeEntryInput = z.infer<typeof timeEntrySchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type ReminderInput = z.infer<typeof reminderSchema>
