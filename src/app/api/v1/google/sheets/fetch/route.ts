import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsClient } from '@/lib/google-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { spreadsheetId, range } = await req.json()

        if (!spreadsheetId) {
            return NextResponse.json({ error: 'Spreadsheet ID required' }, { status: 400 })
        }

        const sheets = await getGoogleSheetsClient()

        // Get spreadsheet metadata
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId,
        })

        // Get all sheet titles
        const sheetTitles = spreadsheet.data.sheets?.map(sheet => ({
            title: sheet.properties?.title || '',
            sheetId: sheet.properties?.sheetId || 0,
            index: sheet.properties?.index || 0,
        })) || []

        // Fetch data from specified range or first sheet
        const targetRange = range || `${sheetTitles[0]?.title}!A1:Z1000`

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: targetRange,
        })

        const rows = response.data.values || []

        if (rows.length === 0) {
            return NextResponse.json({ error: 'No data found in sheet' }, { status: 404 })
        }

        const headers = rows[0]
        const dataRows = rows.slice(1)

        return NextResponse.json({
            success: true,
            data: {
                spreadsheetTitle: spreadsheet.data.properties?.title || '',
                sheets: sheetTitles,
                headers,
                rows: dataRows,
                totalRows: dataRows.length,
            },
        })
    } catch (error: any) {
        console.error('Error fetching Google Sheet:', error)

        if (error.code === 403) {
            return NextResponse.json({
                error: 'Permission denied. Please grant access to Google Sheets.'
            }, { status: 403 })
        }

        if (error.code === 404) {
            return NextResponse.json({
                error: 'Spreadsheet not found. Check the URL and permissions.'
            }, { status: 404 })
        }

        return NextResponse.json({
            error: error.message || 'Failed to fetch spreadsheet'
        }, { status: 500 })
    }
}
