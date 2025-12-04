import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { scheduleSchema } from '@/lib/validations'
import { z } from 'zod'

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
        const validatedData = scheduleSchema.partial().parse(body)

        const schedule = await prisma.schedule.updateMany({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            data: {
                ...validatedData,
                startTime: validatedData.startTime ? new Date(validatedData.startTime) : undefined,
                endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined,
                recurrenceEnd: validatedData.recurrenceEnd ? new Date(validatedData.recurrenceEnd) : undefined,
            },
        })

        if (schedule.count === 0) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        const updatedSchedule = await prisma.schedule.findUnique({
            where: { id: params.id },
            include: { category: true },
        })

        return NextResponse.json(updatedSchedule)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('Error updating schedule:', error)
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

        const result = await prisma.schedule.deleteMany({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        })

        if (result.count === 0) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Schedule deleted successfully' })
    } catch (error) {
        console.error('Error deleting schedule:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
