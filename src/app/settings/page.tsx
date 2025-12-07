'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun, User, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        }
    }, [status, router])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 lg:ml-64">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage your account settings and preferences
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Profile Section */}
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Profile
                                </h2>
                                <div className="flex items-center space-x-4">
                                    {session?.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || 'User'}
                                            className="h-16 w-16 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                                            {(session?.user?.name?.[0] || 'U').toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {session?.user?.name || 'User'}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {session?.user?.email || 'email@example.com'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Appearance Section */}
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Monitor className="h-5 w-5 mr-2" />
                                    Appearance
                                </h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`p-4 rounded-lg border-2 flex flex-col items-center space-y-2 ${theme === 'light'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <Sun className={`h-8 w-8 ${theme === 'light' ? 'text-primary' : 'text-gray-500'}`} />
                                        <span className={`font-medium ${theme === 'light' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                            Light
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`p-4 rounded-lg border-2 flex flex-col items-center space-y-2 ${theme === 'dark'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <Moon className={`h-8 w-8 ${theme === 'dark' ? 'text-primary' : 'text-gray-500'}`} />
                                        <span className={`font-medium ${theme === 'dark' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                            Dark
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`p-4 rounded-lg border-2 flex flex-col items-center space-y-2 ${theme === 'system'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <Monitor className={`h-8 w-8 ${theme === 'system' ? 'text-primary' : 'text-gray-500'}`} />
                                        <span className={`font-medium ${theme === 'system' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                            System
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Notifications Section Placeholder */}
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Bell className="h-5 w-5 mr-2" />
                                    Notifications
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Notification settings coming soon...
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
