'use client'

import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import axios from 'axios'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts'

interface AnalyticsData {
    taskStats: {
        total: number
        completed: number
        inProgress: number
        todo: number
        overdue: number
    }
    timeStats: {
        totalMinutes: number
        todayMinutes: number
        weekMinutes: number
        monthMinutes: number
    }
    completionRate: number
    upcomingEvents: number
    tasksByPriority: { priority: string; count: number }[]
    tasksByCategory: { categoryId: string; categoryName: string; count: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get('/api/v1/analytics')
                setData(res.data)
            } catch (error) {
                console.error('Failed to fetch analytics:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-6 lg:ml-64 flex items-center justify-center h-[calc(100vh-64px)]">
                        <div className="text-gray-500">Loading analytics...</div>
                    </main>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-6 lg:ml-64">
                        <div className="text-red-500">Failed to load analytics data.</div>
                    </main>
                </div>
            </div>
        )
    }

    const priorityData = data.tasksByPriority.map((item) => ({
        name: item.priority,
        value: item.count,
    }))

    const categoryData = data.tasksByCategory.map((item) => ({
        name: item.categoryName,
        value: item.count,
    }))

    const timeData = [
        { name: 'Today', minutes: data.timeStats.todayMinutes },
        { name: 'This Week', minutes: data.timeStats.weekMinutes },
        { name: 'This Month', minutes: data.timeStats.monthMinutes },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 lg:ml-64">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Analytics Dashboard</h1>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {data.completionRate.toFixed(1)}%
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data.taskStats.total}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Tasks</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {data.taskStats.inProgress + data.taskStats.todo}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Time Tracked</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {Math.round(data.timeStats.totalMinutes / 60)} hrs
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Priority Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Tasks by Priority</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={priorityData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="Tasks" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Tasks by Category</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Time Tracking Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Productivity Trends (Minutes)</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="minutes" name="Minutes Tracked" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
