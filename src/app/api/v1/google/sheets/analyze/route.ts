import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { matchAllColumns } from '@/lib/ai/column-matcher'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { headers, sampleRows, userMappings } = await req.json()

        if (!headers || !Array.isArray(headers)) {
            return NextResponse.json({ error: 'Headers array required' }, { status: 400 })
        }

        // Use AI to match columns
        const columnMatches = matchAllColumns(headers, userMappings)

        // Analyze sample data for additional context
        const dataAnalysis = sampleRows ? analyzeDataPatterns(headers, sampleRows) : null

        return NextResponse.json({
            success: true,
            data: {
                columnMatches,
                dataAnalysis,
                suggestions: generateMappingSuggestions(columnMatches),
            },
        })
    } catch (error: any) {
        console.error('Error analyzing columns:', error)
        return NextResponse.json({
            error: error.message || 'Failed to analyze columns'
        }, { status: 500 })
    }
}

/**
 * Analyze actual data patterns to improve matching confidence
 */
function analyzeDataPatterns(headers: string[], rows: any[][]) {
    const analysis: Record<string, {
        dataType: 'text' | 'number' | 'date' | 'boolean' | 'mixed'
        sampleValues: any[]
        nullCount: number
    }> = {}

    headers.forEach((header, colIndex) => {
        const columnValues = rows.map(row => row[colIndex]).filter(v => v != null && v !== '')

        analysis[header] = {
            dataType: detectDataType(columnValues),
            sampleValues: columnValues.slice(0, 3),
            nullCount: rows.length - columnValues.length,
        }
    })

    return analysis
}

/**
 * Detect the data type of a column
 */
function detectDataType(values: any[]): 'text' | 'number' | 'date' | 'boolean' | 'mixed' {
    if (values.length === 0) return 'text'

    const types = values.map(val => {
        const str = String(val).trim()

        // Boolean
        if (['true', 'false', 'yes', 'no', 'x', '✓', '✗'].includes(str.toLowerCase())) {
            return 'boolean'
        }

        // Number
        if (!isNaN(Number(str)) && str !== '') {
            return 'number'
        }

        // Date patterns
        if (isDateLike(str)) {
            return 'date'
        }

        return 'text'
    })

    // If all same type, return that type
    const uniqueTypes = [...new Set(types)]
    if (uniqueTypes.length === 1) {
        return uniqueTypes[0] as any
    }

    // If mostly one type (>80%), return that
    const typeCounts = types.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const dominantType = Object.entries(typeCounts)
        .sort(([, a], [, b]) => b - a)[0]

    if (dominantType && dominantType[1] / types.length > 0.8) {
        return dominantType[0] as any
    }

    return 'mixed'
}

/**
 * Check if string looks like a date
 */
function isDateLike(str: string): boolean {
    // Common date patterns
    const datePatterns = [
        /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
        /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // MM/DD/YYYY or DD/MM/YYYY
        /^\d{1,2}-\d{1,2}-\d{2,4}/, // MM-DD-YYYY
        /^\w{3,9}\s+\d{1,2},?\s+\d{4}/, // Month DD, YYYY
    ]

    return datePatterns.some(pattern => pattern.test(str))
}

/**
 * Generate mapping suggestions based on confidence
 */
function generateMappingSuggestions(columnMatches: any[]) {
    const lowConfidence = columnMatches.filter(m => m.confidence > 0 && m.confidence < 70)
    const unmatched = columnMatches.filter(m => m.confidence === 0)

    return {
        needsReview: lowConfidence.map(m => m.sourceColumn),
        unmatched: unmatched.map(m => m.sourceColumn),
        highConfidence: columnMatches.filter(m => m.confidence >= 85).length,
        totalColumns: columnMatches.length,
    }
}
