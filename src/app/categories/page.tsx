'use client'

import React from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 lg:ml-64">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Categories</h1>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <p className="text-gray-600 dark:text-gray-400">Category management coming soon...</p>
                    </div>
                </main>
            </div>
        </div>
    )
}
