import Link from 'next/link'
import { Calendar, CheckSquare, Clock, BarChart3, Bell, Users } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <nav className="flex justify-between items-center mb-16">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">Scheduler</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/auth/signin"
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/auth/signin"
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </nav>

                <div className="text-center max-w-4xl mx-auto mb-20">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">
                        Manage Your Time,
                        <br />
                        <span className="text-primary">Achieve Your Goals</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 animate-slide-up">
                        A comprehensive scheduling and task management platform with time tracking,
                        analytics, and smart notifications to boost your productivity.
                    </p>
                    <Link
                        href="/auth/signin"
                        className="inline-block px-8 py-4 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                        Start Free Today
                    </Link>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    <FeatureCard
                        icon={<CheckSquare className="h-8 w-8" />}
                        title="Task Management"
                        description="Create, organize, and track tasks with priorities, categories, and tags. Never miss a deadline."
                    />
                    <FeatureCard
                        icon={<Calendar className="h-8 w-8" />}
                        title="Smart Scheduling"
                        description="Plan your events with an intuitive calendar. Support for recurring events and reminders."
                    />
                    <FeatureCard
                        icon={<Clock className="h-8 w-8" />}
                        title="Time Tracking"
                        description="Track time spent on tasks and projects. Analyze your productivity patterns."
                    />
                    <FeatureCard
                        icon={<BarChart3 className="h-8 w-8" />}
                        title="Analytics & Insights"
                        description="Visualize your progress with charts and statistics. Make data-driven decisions."
                    />
                    <FeatureCard
                        icon={<Bell className="h-8 w-8" />}
                        title="Smart Notifications"
                        description="Get timely reminders for tasks and events. Stay on top of your schedule."
                    />
                    <FeatureCard
                        icon={<Users className="h-8 w-8" />}
                        title="Collaboration Ready"
                        description="Share tasks and schedules with your team. Work together seamlessly."
                    />
                </div>

                {/* CTA Section */}
                <div className="text-center bg-primary text-white rounded-2xl p-12 shadow-2xl">
                    <h2 className="text-3xl font-bold mb-4">Ready to boost your productivity?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of users who manage their time effectively with Scheduler.
                    </p>
                    <Link
                        href="/auth/signin"
                        className="inline-block px-8 py-4 bg-white text-primary text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Get Started Now
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-700 py-8">
                <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
                    <p>&copy; 2024 Scheduler App. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="text-primary mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
    )
}