import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { taskSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const categoryId = searchParams.get('categoryId')

        const where: any = { userId: session.user.id }
        if (status) where.status = status
        if (categoryId) where.categoryId = categoryId

        const tasks = await prisma.task.findMany({
            where,
            include: {
                category: true,
                tags: true,
            },
            orderBy: [
                { completed: 'asc' },
                { priority: 'desc' },
                { dueDate: 'asc' },
            ],
        })

        return NextResponse.json(tasks)
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = taskSchema.parse(body)

        const task = await prisma.task.create({
            data: {
                ...validatedData,
                userId: session.user.id,
                dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
            },
            include: {
                category: true,
                tags: true,
            },
        })

        return NextResponse.json(task, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('Error creating task:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { ids, status, all } = body

        const where: any = { userId: session.user.id }

        if (all) {
            // Delete all tasks for user
        } else if (status) {
            // Delete by status
            where.status = status
        } else if (ids && Array.isArray(ids) && ids.length > 0) {
            // Delete specific IDs
            where.id = { in: ids }
        } else {
            return NextResponse.json({ error: 'Invalid delete request. Provide ids, status, or all=true' }, { status: 400 })
        }

        const result = await prisma.task.deleteMany({
            where,
        })

        return NextResponse.json({ success: true, count: result.count })
    } catch (error) {
        console.error('Error deleting tasks:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}