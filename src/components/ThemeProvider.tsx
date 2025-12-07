'use client'

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
            {children}
        </NextThemesProvider>
    )
}

export function useTheme() {
    const { theme, setTheme, resolvedTheme } = useNextTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // During SSR and first mount, resolvedTheme might be undefined
    // We default to 'light' to match the previous behavior if undefined
    const activeTheme = mounted ? (resolvedTheme || theme || 'light') : 'light'

    const toggleTheme = () => {
        setTheme(activeTheme === 'dark' ? 'light' : 'dark')
    }

    return { theme: activeTheme, toggleTheme }
}
