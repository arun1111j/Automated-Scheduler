import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const todayStart = startOfDay(now)
        const todayEnd = endOfDay(now)
        const weekStart = startOfWeek(now)
        const weekEnd = endOfWeek(now)
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        // Task statistics
        const [totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks] = await Promise.all([
            prisma.task.count({ where: { userId: session.user.id } }),
            prisma.task.count({ where: { userId: session.user.id, status: 'COMPLETED' } }),
            prisma.task.count({ where: { userId: session.user.id, status: 'IN_PROGRESS' } }),
            prisma.task.count({ where: { userId: session.user.id, status: 'TODO' } }),
            prisma.task.count({
                where: {
                    userId: session.user.id,
                    dueDate: { lt: now },
                    completed: false,
                },
            }),
        ])

        // Time tracking statistics
        const timeEntries = await prisma.timeEntry.findMany({
            where: { userId: session.user.id },
            select: { duration: true, startTime: true },
        })

        const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
        const todayMinutes = timeEntries
            .filter(e => e.startTime >= todayStart && e.startTime <= todayEnd)
            .reduce((sum, entry) => sum + (entry.duration || 0), 0)
        const weekMinutes = timeEntries
            .filter(e => e.startTime >= weekStart && e.startTime <= weekEnd)
            .reduce((sum, entry) => sum + (entry.duration || 0), 0)
        const monthMinutes = timeEntries
            .filter(e => e.startTime >= monthStart && e.startTime <= monthEnd)
            .reduce((sum, entry) => sum + (entry.duration || 0), 0)

        // Upcoming events
        const upcomingEvents = await prisma.schedule.count({
            where: {
                userId: session.user.id,
                startTime: { gte: now },
            },
        })

        // Tasks by priority
        const tasksByPriority = await prisma.task.groupBy({
            by: ['priority'],
            where: { userId: session.user.id, completed: false },
            _count: true,
        })

        // Tasks by category
        const tasksByCategory = await prisma.task.groupBy({
            by: ['categoryId'],
            where: { userId: session.user.id },
            _count: true,
        })

        // Fetch category names
        const categoryIds = tasksByCategory
            .map(t => t.categoryId)
            .filter((id): id is string => id !== null)

        const categories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true }
        })

        const categoryMap = new Map(categories.map(c => [c.id, c.name]))

        const analytics = {
            taskStats: {
                total: totalTasks,
                completed: completedTasks,
                inProgress: inProgressTasks,
                todo: todoTasks,
                overdue: overdueTasks,
            },
            timeStats: {
                totalMinutes,
                todayMinutes,
                weekMinutes,
                monthMinutes,
            },
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            upcomingEvents,
            tasksByPriority: tasksByPriority.map(item => ({
                priority: item.priority,
                count: item._count,
            })),
            tasksByCategory: tasksByCategory.map(item => ({
                categoryId: item.categoryId,
                categoryName: item.categoryId ? categoryMap.get(item.categoryId) || 'Unknown' : 'Unassigned',
                count: item._count,
            })),
        }

        return NextResponse.json(analytics)
    } catch (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
