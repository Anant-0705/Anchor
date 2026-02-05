'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Target,
    ListTodo,
    Settings,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
        { icon: Target, label: 'Habits', href: '/dashboard/habits' },
        { icon: ListTodo, label: 'Tasks', href: '/dashboard/tasks' },
        { icon: User, label: 'Profile', href: '/dashboard/profile' },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 hidden md:flex flex-col"
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    {isSidebarOpen ? (
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Anchor</span>
                    ) : (
                        <span className="text-xl font-bold text-blue-600">A</span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="ml-auto text-gray-400 hover:text-gray-900"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </Button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}>
                                    <item.icon size={20} className={cn(isActive && "text-blue-600")} />
                                    {isSidebarOpen && (
                                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50",
                            !isSidebarOpen && "justify-center px-0"
                        )}
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="ml-3">Logout</span>}
                    </Button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className={cn(
                "flex-1 transition-all duration-300",
                isSidebarOpen ? "md:ml-[280px]" : "md:ml-[80px]"
            )}>
                <main className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
