import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { taskSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const task = await prisma.task.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            include: {
                category: true,
                tags: true,
                timeEntries: true,
            },
        })

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        return NextResponse.json(task)
    } catch (error) {
        console.error('Error fetching task:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = taskSchema.partial().parse(body)

        const task = await prisma.task.updateMany({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            data: {
                ...validatedData,
                dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
                completedAt: (validatedData.completed ? new Date() : null) as any,
            },
        })

        if (task.count === 0) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        const updatedTask = await prisma.task.findUnique({
            where: { id: params.id },
            include: {
                category: true,
                tags: true,
            },
        })

        return NextResponse.json(updatedTask)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('Error updating task:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const result = await prisma.task.deleteMany({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        })

        if (result.count === 0) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Task deleted successfully' })
    } catch (error) {
        console.error('Error deleting task:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
