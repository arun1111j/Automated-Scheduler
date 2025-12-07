import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getGoogleSheetsClient() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        throw new Error('Not authenticated')
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    // Get access token from session
    // Note: We'll need to store this in the Account model via NextAuth callbacks
    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            provider: 'google',
        },
    })

    if (!account?.access_token) {
        throw new Error('No Google access token found')
    }

    auth.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    })

    return google.sheets({ version: 'v4', auth })
}

export async function getGoogleDocsClient() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        throw new Error('Not authenticated')
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            provider: 'google',
        },
    })

    if (!account?.access_token) {
        throw new Error('No Google access token found')
    }

    auth.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    })

    return google.docs({ version: 'v1', auth })
}

export async function getGoogleDriveClient() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        throw new Error('Not authenticated')
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            provider: 'google',
        },
    })

    if (!account?.access_token) {
        throw new Error('No Google access token found')
    }

    auth.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    })

    return google.drive({ version: 'v3', auth })
}

export async function getGoogleCalendarClient() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        throw new Error('Not authenticated')
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            provider: 'google',
        },
    })

    if (!account?.access_token) {
        throw new Error('No Google access token found')
    }

    auth.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    })

    return google.calendar({ version: 'v3', auth })
}

// Helper to refresh token if needed
export async function refreshGoogleToken(userId: string) {
    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: 'google',
        },
    })

    if (!account?.refresh_token) {
        throw new Error('No refresh token available')
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    auth.setCredentials({
        refresh_token: account.refresh_token,
    })

    const { credentials } = await auth.refreshAccessToken()

    // Update the access token in database
    await prisma.account.update({
        where: { id: account.id },
        data: {
            access_token: credentials.access_token,
            expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
        },
    })

    return credentials.access_token
}

import { prisma } from '@/lib/db/prisma'
