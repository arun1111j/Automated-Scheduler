'use client'

import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Bell, Save } from 'lucide-react'

export default function NotificationSettingsPage() {
    const [email, setEmail] = useState(true)
    const [push, setPush] = useState(false)
    const [reminderTiming, setReminderTiming] = useState('1_HOUR')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/v1/notifications/settings')
                const data = res.data
                setEmail(data.email)
                setPush(data.push)
                setReminderTiming(data.reminderTiming)
            } catch (error) {
                console.error('Failed to load settings', error)
                toast.error('Failed to load settings')
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            await axios.put('/api/v1/notifications/settings', {
                email,
                push,
                reminderTiming,
            })
            toast.success('Settings saved successfully')
        } catch (error) {
            console.error('Failed to save settings', error)
            toast.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 lg:ml-64">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Notification Settings</h1>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <Bell className="h-5 w-5 mr-2 text-primary" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Manage how and when you receive notifications.
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {loading ? (
                                <div className="text-center py-4 text-gray-500">Loading preferences...</div>
                            ) : (
                                <>
                                    {/* Channels */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Channels</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Email Notifications
                                                    </label>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Receive summaries and urgent alerts via email.
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={email}
                                                        onChange={(e) => setEmail(e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Push Notifications
                                                    </label>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Receive real-time alerts on your device.
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={push}
                                                        onChange={(e) => setPush(e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timing */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Reminder Timing</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                When should we remind you before a task is due?
                                            </label>
                                            <select
                                                value={reminderTiming}
                                                onChange={(e) => setReminderTiming(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="15_MIN">15 Minutes before</option>
                                                <option value="1_HOUR">1 Hour before</option>
                                                <option value="1_DAY">1 Day before</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {saving ? 'Saving...' : 'Save Preferences'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
