
'use client'

import React from 'react'
import { ToolbarProps } from 'react-big-calendar'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

export default function CustomToolbar(props: ToolbarProps) {
    const { date, onNavigate, onView, view } = props

    const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        onNavigate(action)
    }

    const goToBack = () => {
        navigate('PREV')
    }

    const goToNext = () => {
        navigate('NEXT')
    }

    const goToCurrent = () => {
        navigate('TODAY')
    }

    const label = () => {
        return format(date, 'MMMM yyyy')
    }

    return (
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-4 md:space-y-0 p-2">
            <div className="flex items-center space-x-2">
                <button
                    onClick={goToCurrent}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                    Today
                </button>
                <div className="flex items-center rounded-md text-gray-700 bg-white border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600">
                    <button
                        onClick={goToBack}
                        className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-l-md border-r border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {label()}
            </h2>

            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                {['month', 'week', 'day', 'agenda'].map((v) => (
                    <button
                        key={v}
                        onClick={() => onView(v as any)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${view === v
                                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
        </div>
    )
}
