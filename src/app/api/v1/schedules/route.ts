import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { scheduleSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const start = searchParams.get('start')
        const end = searchParams.get('end')

        const where: any = { userId: session.user.id }

        if (start && end) {
            where.startTime = {
                gte: new Date(start),
                lte: new Date(end),
            }
        }

        const schedules = await prisma.schedule.findMany({
            where,
            include: {
                category: true,
            },
            orderBy: {
                startTime: 'asc',
            },
        })

        return NextResponse.json(schedules)
    } catch (error) {
        console.error('Error fetching schedules:', error)
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
        const validatedData = scheduleSchema.parse(body)

        const schedule = await prisma.schedule.create({
            data: {
                ...validatedData,
                userId: session.user.id,
                startTime: new Date(validatedData.startTime),
                endTime: new Date(validatedData.endTime),
                recurrenceEnd: validatedData.recurrenceEnd ? new Date(validatedData.recurrenceEnd) : null,
            },
            include: {
                category: true,
            },
        })

        return NextResponse.json(schedule, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('Error creating schedule:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}