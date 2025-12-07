
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { importTaskData } from '@/lib/helpers/taskImport'
import * as XLSX from 'xlsx'
import { parse, isValid } from 'date-fns'

// Expected payload shape
const importBodySchema = z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.any())),
    mappings: z.record(z.string()), // sourceColumn -> targetField
    filterColumn: z.string().optional(),
    filterValue: z.string().optional(),
})

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let headers: string[] = []
        let rows: any[][] = []
        let mappings: Record<string, string> = {}
        let filterColumn: string | undefined
        let filterValue: string | undefined

        const contentType = req.headers.get('content-type') || ''

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData()
            const file = formData.get('file') as File
            const rawMappings = formData.get('mappings') as string

            mappings = rawMappings ? JSON.parse(rawMappings) : {}
            filterColumn = formData.get('filterColumn') as string || undefined
            filterValue = formData.get('filterValue') as string || undefined

            if (!file) {
                return NextResponse.json({ error: 'No file uploaded. Please upload the file again to import all rows.' }, { status: 400 })
            }

            // Parse the full file
            const buffer = await file.arrayBuffer()
            const workbook = XLSX.read(buffer, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            // Get all rows
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

            if (data.length > 0) {
                headers = data[0].map(h => String(h))
                rows = data.slice(1) // ALL rows, not just sample
            }
        } else {
            // Fallback for JSON payload (legacy or small data)
            const body = await req.json()
            const parsed = importBodySchema.safeParse(body)
            if (!parsed.success) {
                return NextResponse.json({ error: 'Invalid payload', details: parsed.error.errors }, { status: 400 })
            }
            headers = parsed.data.headers
            rows = parsed.data.rows
            mappings = parsed.data.mappings
            filterColumn = parsed.data.filterColumn
            filterValue = parsed.data.filterValue
        }

        // Build column index map
        const colIndex: Record<string, number> = {}
        headers.forEach((h, i) => {
            colIndex[h] = i
        })

        console.log(`[Import] Processing ${rows.length} rows. Filter: ${filterColumn}=${filterValue}`)

        const createdTasks = []
        let skippedCount = 0
        let validationFailedCount = 0

        for (const row of rows) {
            // Apply filtering if parameters are provided
            if (filterColumn && filterValue) {
                const idx = colIndex[filterColumn]
                if (idx !== undefined) {
                    const rowValue = String(row[idx] || '').trim().toLowerCase()
                    const targetValue = filterValue.trim().toLowerCase()

                    if (rowValue !== targetValue) {
                        skippedCount++
                        continue // Skip this row
                    }
                }
            }

            const taskData: any = {}
            const descriptionParts: string[] = []
            const rowTags: string[] = []

            // Map each target field using the provided mappings
            for (const [sourceCol, targetField] of Object.entries(mappings)) {
                if (!targetField) continue // ignored column

                const idx = colIndex[sourceCol]
                if (idx === undefined) continue

                const value = row[idx]
                // Skip completely empty values
                if (value === undefined || value === null || String(value).trim() === '') continue

                if (targetField === 'description') {
                    // Accumulate descriptions
                    descriptionParts.push(`${sourceCol}: ${value}`)
                } else if (targetField === 'tags') {
                    // Accumulate tags
                    rowTags.push(String(value).trim())
                } else if (targetField === 'dueDate') {
                    // Try to parse date
                    const parsedDate = parseFlexibleDate(value)
                    if (parsedDate) {
                        taskData.dueDate = parsedDate.toISOString()
                    }
                } else if (targetField === 'priority') {
                    const allowed = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
                    taskData.priority = allowed.includes(String(value).toUpperCase()) ? String(value).toUpperCase() : 'MEDIUM'
                } else {
                    // Single value fields (title, etc)
                    taskData[targetField] = value
                }
            }

            // Combine description parts
            if (descriptionParts.length > 0) {
                taskData.description = descriptionParts.join('\n')
            }

            // Attach required fields
            taskData.userId = session.user.id
            taskData.status = 'TODO'

            // Validate and clean data using helper
            const cleanData = await importTaskData(taskData, session.user.id)
            if (!cleanData) {
                validationFailedCount++
                continue
            }

            // DB Transaction to create task and link tags
            const created = await prisma.task.create({
                data: {
                    ...cleanData,
                    tags: {
                        connectOrCreate: rowTags.map(tag => ({
                            where: { name: tag },
                            create: { name: tag }
                        }))
                    }
                },
                include: {
                    tags: true
                }
            })
            createdTasks.push(created)
        }

        return NextResponse.json({
            success: true,
            imported: createdTasks.length,
            skipped: skippedCount,
            validationFailed: validationFailedCount,
            tasks: createdTasks
        })
    } catch (error: any) {
        console.error('Error importing Google Sheet', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}

function parseFlexibleDate(value: any): Date | null {
    if (!value) return null

    const str = String(value).trim()
    if (!str) return null

    // 1. Try standard JS Date constructor (handles ISO, MM/DD/YYYY, etc)
    let date = new Date(value)
    if (isValid(date) && date.getFullYear() > 1900) return date

    // 2. Try parsing Excel serial number
    if (typeof value === 'number' || (str.match(/^\d+$/) && Number(str) > 20000)) {
        // Excel base date 1900-01-01 approx
        const num = Number(value)
        return new Date(Math.round((num - 25569) * 86400 * 1000))
    }

    // 3. Robust Regex for DD[./-]MM[./-](YYYY or YY)
    // Matches: 30/12/2025, 30.12.2025, 30-12-25
    const dmY = str.match(/^(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{2,4})/)
    if (dmY) {
        const day = parseInt(dmY[1])
        const month = parseInt(dmY[2]) - 1 // JS months are 0-indexed
        let year = parseInt(dmY[3])
        // Handle 2 digit year
        if (year < 100) year += 2000

        date = new Date(year, month, day)
        if (isValid(date)) return date
    }

    console.log(`[Import] Failed to parse date: "${str}"`)
    return null
}
