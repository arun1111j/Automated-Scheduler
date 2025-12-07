
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const activeEntry = await prisma.timeEntry.findFirst({
            where: { userId: session.user.id, endTime: null },
            include: { task: true },
        })

        return NextResponse.json(activeEntry || null)
    } catch (error) {
        console.error('Error fetching active timer:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
