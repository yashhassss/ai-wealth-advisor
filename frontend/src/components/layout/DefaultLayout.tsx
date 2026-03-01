import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import {
    LayoutDashboard,
    PieChart,
    MessageSquare,
    TrendingUp,
    BookOpen,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react'

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Mock Portfolio', path: '/portfolio', icon: PieChart },
    { name: 'AI Advisor', path: '/advisor', icon: MessageSquare },
    { name: 'Recommendations', path: '/recommendations', icon: TrendingUp },
    { name: 'Education', path: '/education', icon: BookOpen },
    { name: 'Profile', path: '/profile', icon: User },
]

export const DefaultLayout = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    // If no user, just render a simple top nav (for landing page/login)
    if (!user) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-main)] flex flex-col">
                <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-surface-light)] glass-panel sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center font-bold text-gray-900">W</div>
                        <Link to="/" className="text-xl font-bold tracking-tight text-white">Wealth<span className="text-[var(--color-accent)]">AI</span></Link>
                    </div>
                    <Link to="/login" className="text-sm font-medium bg-[var(--color-accent)] text-gray-900 px-5 py-2 rounded-[var(--radius-button)] transition hover:bg-[var(--color-accent-hover)] glow-accent">Sign In</Link>
                </header>
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-main)] flex overflow-hidden">

            {/* Sidebar (Desktop) & Mobile Drawer */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-surface)] border-r border-[var(--color-surface-light)] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:w-64 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-surface-light)]">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center font-bold text-gray-900">W</div>
                        <span className="text-xl font-bold tracking-tight text-white">Wealth<span className="text-[var(--color-accent)]">AI</span></span>
                    </Link>
                    <button className="md:hidden text-[var(--color-text-muted)] hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {navItems.map((item) => {
                        const active = item.path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.path)
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)] transition-all duration-200 ${active
                                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20'
                                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-light)] hover:text-white glow-accent-hover'
                                    }`}
                            >
                                <Icon size={20} className={active ? 'text-[var(--color-accent)]' : ''} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Sidebar */}
                <div className="p-4 border-t border-[var(--color-surface-light)]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-[var(--radius-button)] text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-[var(--color-surface-light)] bg-[var(--color-surface)]/80 backdrop-blur z-30">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-[var(--color-text-muted)] hover:text-white" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-white hidden sm:block">
                            {navItems.find(i => location.pathname.startsWith(i.path))?.name || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                        <div className="flex items-center gap-2">
                            <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold shadow-lg text-white hover:opacity-90 transition-opacity">
                                {user.email?.charAt(0).toUpperCase() || 'U'}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}
