import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        })

        return NextResponse.json(notifications)
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const markAllRead = searchParams.get('markAllRead') === 'true'

        if (markAllRead) {
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    read: false,
                },
                data: {
                    read: true,
                },
            })
            return NextResponse.json({ message: 'All notifications marked as read' })
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    } catch (error) {
        console.error('Error updating notifications:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
