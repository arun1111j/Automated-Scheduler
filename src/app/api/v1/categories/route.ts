import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { categorySchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const categories = await prisma.category.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                _count: {
                    select: {
                        tasks: true,
                        schedules: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
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
        const validatedData = categorySchema.parse(body)

        const category = await prisma.category.create({
            data: {
                ...validatedData,
                userId: session.user.id,
            },
        })

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('Error creating category:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
