
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { calculateDuration } from '@/lib/utils'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const activeEntry = await prisma.timeEntry.findFirst({
            where: { userId: session.user.id, endTime: null },
        })

        if (!activeEntry) {
            return NextResponse.json({ error: 'No active timer found' }, { status: 404 })
        }

        const now = new Date()
        const duration = calculateDuration(activeEntry.startTime, now)

        const updated = await prisma.timeEntry.update({
            where: { id: activeEntry.id },
            data: { endTime: now, duration },
            include: { task: true },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error stopping timer:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
