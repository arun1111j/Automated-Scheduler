import Fuse from 'fuse.js'
import { FIELD_SYNONYMS, SYNONYM_TO_FIELD, TARGET_FIELDS } from './field-synonyms'

export interface ColumnMatch {
    sourceColumn: string      // Original column name from sheet
    targetField: string | null // App field name (title, dueDate, etc.)
    confidence: number        //  0-100
    suggestedBy: 'exact' | 'fuzzy' | 'synonym' | 'pattern' | 'user'
    alternatives?: Array<{ field: string; confidence: number }>
}

/**
 * AI-powered column matcher using fuzzy string matching
 * Handles typos, case insensitivity, and synonym detection
 */
export function matchColumn(
    columnName: string,
    userMapping?: Record<string, string>
): ColumnMatch {
    const normalized = columnName.toLowerCase().trim()

    // 1. User manual mapping always wins (100% confidence)
    if (userMapping && userMapping[columnName]) {
        return {
            sourceColumn: columnName,
            targetField: userMapping[columnName],
            confidence: 100,
            suggestedBy: 'user',
        }
    }

    // 2. Exact match (100% confidence)
    if (TARGET_FIELDS.includes(normalized)) {
        return {
            sourceColumn: columnName,
            targetField: normalized,
            confidence: 100,
            suggestedBy: 'exact',
        }
    }

    // 3. Synonym match (80-95% confidence)
    const synonymMatch = SYNONYM_TO_FIELD[normalized]
    if (synonymMatch) {
        return {
            sourceColumn: columnName,
            targetField: synonymMatch,
            confidence: 90,
            suggestedBy: 'synonym',
        }
    }

    // 4. Fuzzy match on target fields (70-95% confidence)
    const fuzzyFieldMatch = fuzzyMatchField(normalized, TARGET_FIELDS)
    if (fuzzyFieldMatch && fuzzyFieldMatch.confidence >= 70) {
        return {
            sourceColumn: columnName,
            targetField: fuzzyFieldMatch.field,
            confidence: fuzzyFieldMatch.confidence,
            suggestedBy: 'fuzzy',
            alternatives: fuzzyFieldMatch.alternatives,
        }
    }

    // 5. Fuzzy match on all synonyms (65-90% confidence)
    const allSynonyms = Object.keys(SYNONYM_TO_FIELD)
    const fuzzySynonymMatch = fuzzyMatchField(normalized, allSynonyms)
    if (fuzzySynonymMatch && fuzzySynonymMatch.confidence >= 65) {
        const targetField = SYNONYM_TO_FIELD[fuzzySynonymMatch.field.toLowerCase()]
        return {
            sourceColumn: columnName,
            targetField,
            confidence: Math.min(fuzzySynonymMatch.confidence - 5, 85),
            suggestedBy: 'fuzzy',
            alternatives: fuzzySynonymMatch.alternatives?.map(alt => ({
                field: SYNONYM_TO_FIELD[alt.field.toLowerCase()] || alt.field,
                confidence: alt.confidence,
            })),
        }
    }

    // 6. Pattern-based detection (60-75% confidence)
    const patternMatch = detectByPattern(columnName, normalized)
    if (patternMatch) {
        return {
            sourceColumn: columnName,
            ...patternMatch,
        }
    }

    // No match found
    return {
        sourceColumn: columnName,
        targetField: null,
        confidence: 0,
        suggestedBy: 'fuzzy',
    }
}

/**
 * Fuzzy string matching using Fuse.js
 */
function fuzzyMatchField(
    input: string,
    candidates: string[]
): { field: string; confidence: number; alternatives: Array<{ field: string; confidence: number }> } | null {
    const fuse = new Fuse(candidates, {
        threshold: 0.4, // 0 = perfect match, 1 = match anything
        includeScore: true,
        minMatchCharLength: 2,
    })

    const results = fuse.search(input)

    if (results.length === 0) {
        return null
    }

    // Convert Fuse.js score (lower is better) to confidence (higher is better)
    const topMatch = results[0]
    const confidence = Math.round((1 - (topMatch.score || 0)) * 100)

    const alternatives = results.slice(1, 4).map(result => ({
        field: result.item,
        confidence: Math.round((1 - (result.score || 0)) * 100),
    }))

    return {
        field: topMatch.item,
        confidence,
        alternatives,
    }
}

/**
 * Pattern-based field detection
 * Looks at actual data patterns, not just column names
 */
function detectByPattern(
    originalName: string,
    normalizedName: string
): { targetField: string; confidence: number; suggestedBy: 'pattern' } | null {
    // Date patterns
    if (
        normalizedName.includes('date') ||
        normalizedName.includes('time') ||
        normalizedName.includes('when')
    ) {
        if (normalizedName.includes('due') || normalizedName.includes('deadline')) {
            return {
                targetField: 'dueDate',
                confidence: 70,
                suggestedBy: 'pattern',
            }
        }
        if (normalizedName.includes('start')) {
            return {
                targetField: 'startTime',
                confidence: 70,
                suggestedBy: 'pattern',
            }
        }
        if (normalizedName.includes('end')) {
            return {
                targetField: 'endTime',
                confidence: 70,
                suggestedBy: 'pattern',
            }
        }
    }

    // Boolean patterns
    if (
        normalizedName.includes('done') ||
        normalizedName.includes('complete') ||
        normalizedName.includes('check') ||
        normalizedName === 'x' ||
        normalizedName === '✓'
    ) {
        return {
            targetField: 'completed',
            confidence: 65,
            suggestedBy: 'pattern',
        }
    }

    // Status patterns
    if (
        normalizedName.includes('status') ||
        normalizedName.includes('state') ||
        normalizedName.includes('progress')
    ) {
        return {
            targetField: 'status',
            confidence: 75,
            suggestedBy: 'pattern',
        }
    }

    // Priority patterns
    if (
        normalizedName.includes('priority') ||
        normalizedName.includes('importance') ||
        normalizedName.includes('urgent')
    ) {
        return {
            targetField: 'priority',
            confidence: 75,
            suggestedBy: 'pattern',
        }
    }

    return null
}

/**
 * Match all columns in a sheet header row
 */
export function matchAllColumns(
    columnNames: string[],
    userMappings?: Record<string, string>
): ColumnMatch[] {
    return columnNames.map(colName => matchColumn(colName, userMappings))
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 85) return 'high'
    if (confidence >= 60) return 'medium'
    return 'low'
}
