'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Calendar, Clock, BarChart3, FolderKanban } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Time Tracking', href: '/time-tracking', icon: Clock },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Categories', href: '/categories', icon: FolderKanban },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}