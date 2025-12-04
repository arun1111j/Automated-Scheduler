'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Calendar, Bell, Moon, Sun, LogOut, User, Settings } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Header() {
    const { data: session } = useSession()
    const { theme, toggleTheme } = useTheme()
    const [notifications, setNotifications] = useState<any[]>([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)

    useEffect(() => {
        if (session) {
            fetchNotifications()
        }
    }, [session])

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/v1/notifications')
            setNotifications(response.data.filter((n: any) => !n.read).slice(0, 5))
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' })
    }

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <Calendar className="h-8 w-8 text-primary-600" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                            Scheduler
                        </span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            )}
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                                aria-label="Notifications"
                            >
                                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                    </div>
                                    {notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                            >
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {notification.message}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No new notifications
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        {session && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || 'User'}
                                            className="h-8 w-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                                        {session.user?.name || 'User'}
                                    </span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                        <Link
                                            href="/settings"
                                            className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        >
                                            <Settings className="h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 w-full text-left"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}