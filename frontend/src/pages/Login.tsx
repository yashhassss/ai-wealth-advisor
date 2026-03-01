import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

export const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error
            navigate('/profile')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during login.'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[var(--color-surface)] rounded-[var(--radius-ui)] p-8 shadow-2xl border border-[var(--color-surface-light)] relative overflow-hidden">
                {/* Subtle top accent gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-50"></div>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-accent)] to-blue-500 rounded-[var(--radius-ui)] mx-auto flex items-center justify-center font-bold text-2xl text-gray-900 mb-4 shadow-lg">W</div>
                    <h1 className="text-[32px] font-bold tracking-tight text-white mb-2 leading-tight">Welcome Back</h1>
                    <p className="text-[var(--color-text-muted)] text-base">Sign in to your wealth advisor</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-[var(--color-semantic-down)]/10 border border-[var(--color-semantic-down)]/30 rounded-[var(--radius-ui)] text-[var(--color-semantic-down)] text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-ui)] px-4 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-200 placeholder:text-gray-600"
                            placeholder="you@domain.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-ui)] pl-4 pr-12 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-200 placeholder:text-gray-600"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full h-12 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-gray-900 font-bold text-base rounded-[var(--radius-button)] transition-all duration-200 glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--color-surface-light)] text-center text-sm text-[var(--color-text-muted)]">
                    Don't have an account? <Link to="/register" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium transition-colors ml-1">Create one now</Link>
                </div>
            </div>
        </div>
    )
}
