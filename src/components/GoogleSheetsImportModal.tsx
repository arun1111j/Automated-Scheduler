// GoogleSheetsImportModal.tsx
'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface MappingOption {
    source: string
    target: string
}

export default function GoogleSheetsImportModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) {
    const [file, setFile] = useState<File | null>(null)
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<any>(null)
    const [mappings, setMappings] = useState<Record<string, string>>({})

    if (!isOpen) return null

    const handleAnalyze = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            if (file) {
                formData.append('file', file)
            } else if (url) {
                formData.append('url', url)
            }
            const res = await axios.post('/api/v1/google/sheets/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setSuggestions(res.data.data)
            // initialize mappings with AI suggestions
            const init: Record<string, string> = {}
            res.data.data.columnMatches.forEach((m: any) => {
                init[m.sourceColumn] = m.suggestedTarget || ''
            })
            setMappings(init)
        } catch (e) {
            console.error(e)
            toast.error('Failed to analyze sheet')
        } finally {
            setLoading(false)
        }
    }

    const handleImport = async () => {
        if (!suggestions) return
        setLoading(true)
        try {
            await axios.post('/api/v1/google/sheets/import', {
                headers: suggestions.headers,
                rows: suggestions.sampleRows,
                mappings,
            })
            toast.success('Tasks imported successfully')
            onClose()
        } catch (e) {
            console.error(e)
            toast.error('Import failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg animate-fade-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Import Google Sheet
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Upload File (CSV/Excel)
                            </label>
                            <input
                                type="file"
                                onChange={e => setFile(e.target.files?.[0] ?? null)}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                            />
                        </div>
                        <div className="text-center text-gray-500">or</div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Google Sheets URL
                            </label>
                            <input
                                type="text"
                                placeholder="https://docs.google.com/spreadsheets/..."
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>
                        {suggestions && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    Column Mappings
                                </h3>
                                {suggestions.columnMatches.map((m: any) => (
                                    <div key={m.sourceColumn} className="flex items-center space-x-2">
                                        <span className="w-1/3 text-sm text-gray-700 dark:text-gray-300">
                                            {m.sourceColumn}
                                        </span>
                                        <select
                                            value={mappings[m.sourceColumn] || ''}
                                            onChange={e => setMappings({ ...mappings, [m.sourceColumn]: e.target.value })}
                                            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                                        >
                                            <option value="">Ignore</option>
                                            <option value="title">Title</option>
                                            <option value="description">Description</option>
                                            <option value="dueDate">Due Date</option>
                                            <option value="priority">Priority</option>
                                        </select>
                                    </div>
                                ))}
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="button"
                                        onClick={handleImport}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Importing...' : 'Import Tasks'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
