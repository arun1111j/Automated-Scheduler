
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { timeEntrySchema } from '@/lib/validations'
import { z } from 'zod'
import { calculateDuration } from '@/lib/utils'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const taskId = searchParams.get('taskId')

        const where: any = { userId: session.user.id }
        if (taskId) where.taskId = taskId

        const timeEntries = await prisma.timeEntry.findMany({
            where,
            include: {
                task: true,
            },
            orderBy: {
                startTime: 'desc',
            },
            take: 100,
        })

        return NextResponse.json(timeEntries)
    } catch (error) {
        console.error('Error fetching time entries:', error)
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
        const validatedData = timeEntrySchema.parse(body)

        const startTime = new Date(validatedData.startTime)
        const endTime = validatedData.endTime ? new Date(validatedData.endTime) : null
        const duration = endTime ? calculateDuration(startTime, endTime) : null

        // If no end time, this is a "Start Timer" request.
        // Check if there is already an active timer.
        if (!endTime) {
            const activeEntry = await prisma.timeEntry.findFirst({
                where: { userId: session.user.id, endTime: null },
            })
            if (activeEntry) {
                return NextResponse.json({ error: 'A timer is already running. Please stop it first.' }, { status: 400 })
            }
        }

        const timeEntry = await prisma.timeEntry.create({
            data: {
                ...validatedData,
                userId: session.user.id,
                startTime,
                endTime,
                duration,
            },
            include: {
                task: true,
            },
        })

        return NextResponse.json(timeEntry, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('Error creating time entry:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}