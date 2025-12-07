// src/app/api/v1/google/sheets/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { importTaskData } from '@/lib/helpers/taskImport'

// Expected payload shape
const importBodySchema = z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.any())),
    mappings: z.record(z.string()), // sourceColumn -> targetField
})

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const parsed = importBodySchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload', details: parsed.error.errors }, { status: 400 })
        }
        const { headers, rows, mappings } = parsed.data

        // Build column index map
        const colIndex: Record<string, number> = {}
        headers.forEach((h, i) => {
            colIndex[h] = i
        })

        const createdTasks = []
        for (const row of rows) {
            const taskData: any = {}
            // Map each target field using the provided mappings
            for (const [sourceCol, targetField] of Object.entries(mappings)) {
                if (!targetField) continue // ignored column
                const idx = colIndex[sourceCol]
                if (idx === undefined) continue
                const value = row[idx]
                if (targetField === 'dueDate' && value) {
                    // Try to parse date
                    const date = new Date(value)
                    if (!isNaN(date.getTime())) {
                        taskData.dueDate = date.toISOString()
                    }
                } else if (targetField === 'priority') {
                    // Accept only allowed enum values, fallback to MEDIUM
                    const allowed = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
                    taskData.priority = allowed.includes(String(value).toUpperCase()) ? String(value).toUpperCase() : 'MEDIUM'
                } else {
                    taskData[targetField] = value
                }
            }

            // Attach required fields
            taskData.userId = session.user.id

            // Validate and clean data using helper
            const cleanData = await importTaskData(taskData, session.user.id)
            if (!cleanData) {
                // Skip invalid row
                continue
            }

            const created = await prisma.task.create({
                data: cleanData,
            })
            createdTasks.push(created)
        }

        return NextResponse.json({ success: true, imported: createdTasks.length, tasks: createdTasks })
    } catch (error: any) {
        console.error('Error importing Google Sheet', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
