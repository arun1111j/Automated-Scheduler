'use client'

import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Bell, Save, Trash2, AlertTriangle, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
    const { data: session } = useSession()
    const router = useRouter()

    // Notification Settings State
    const [email, setEmail] = useState(true)
    const [push, setPush] = useState(false)
    const [reminderTiming, setReminderTiming] = useState('1_HOUR')
    const [loadingMsg, setLoadingMsg] = useState(false)
    const [savingMsg, setSavingMsg] = useState(false)

    // Account Settings State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            setLoadingMsg(true)
            try {
                const res = await axios.get('/api/v1/notifications/settings')
                const data = res.data
                setEmail(data.email)
                setPush(data.push)
                setReminderTiming(data.reminderTiming)
            } catch (error) {
                console.error('Failed to load settings', error)
                toast.error('Failed to load notification settings')
            } finally {
                setLoadingMsg(false)
            }
        }
        fetchSettings()
    }, [])

    const handleSaveNotifications = async () => {
        setSavingMsg(true)
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
            setSavingMsg(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!session?.user?.id) return
        setDeleting(true)
        try {
            await axios.delete(`/api/v1/users/${session.user.id}`)
            toast.success('Account deleted successfully')
            signOut({ callbackUrl: '/' })
        } catch (error) {
            console.error('Failed to delete account', error)
            toast.error('Failed to delete account')
            setDeleting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 lg:ml-64">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

                    <div className="space-y-8 max-w-2xl">
                        {/* Notification Settings */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                    <Bell className="h-5 w-5 mr-2 text-primary" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                                </div>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Manage how and when you receive notifications.
                                </p>
                            </div>

                            <div className="p-6 space-y-6">
                                {loadingMsg ? (
                                    <div className="text-center py-4 text-gray-500">Loading preferences...</div>
                                ) : (
                                    <>
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

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Reminder Timing
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

                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleSaveNotifications}
                                                disabled={savingMsg}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                {savingMsg ? 'Saving...' : 'Save Preferences'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Account Settings */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center text-red-600">
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    <h2 className="text-lg font-semibold">Danger Zone</h2>
                                </div>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Irreversible actions for your account.
                                </p>
                            </div>
                            <div className="p-6">
                                {!showDeleteConfirm ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Permanently delete your account and all associated data.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                        <h3 className="text-sm font-bold text-red-800 dark:text-red-200 mb-2">Are you absolutely sure?</h3>
                                        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                            This action cannot be undone. This will permanently delete your account, tasks, and all data.
                                        </p>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleting}
                                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
