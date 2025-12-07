
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const settingsSchema = z.object({
    email: z.boolean(),
    push: z.boolean(),
    reminderTiming: z.enum(['15_MIN', '1_HOUR', '1_DAY']),
})

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let settings = await prisma.notificationPreference.findUnique({
            where: { userId: session.user.id },
        })

        if (!settings) {
            settings = await prisma.notificationPreference.create({
                data: {
                    userId: session.user.id,
                    email: true,
                    push: false,
                    reminderTiming: '1_HOUR',
                },
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching notification settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const validated = settingsSchema.safeParse(body)
        if (!validated.success) {
            return NextResponse.json({ error: 'Invalid settings', details: validated.error.errors }, { status: 400 })
        }

        const settings = await prisma.notificationPreference.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                ...validated.data,
            },
            update: {
                ...validated.data,
            },
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error updating notification settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
