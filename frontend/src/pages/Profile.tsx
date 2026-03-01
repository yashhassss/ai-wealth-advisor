import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api.ts'
import { User, Mail, Save, AlertTriangle } from 'lucide-react'

export const Profile = () => {
    const { user } = useAuth()
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState({ text: '', type: '' })

    const [formData, setFormData] = useState({
        fullName: 'Demo User',
        email: user?.email || '',
        riskProfile: 'Moderate',
        income: 50000,
        goals: 'Retirement',
        timeHorizon: '10+ years'
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get('/profile')
                if (data && !data.error) {
                    setFormData({
                        fullName: data.name || 'Demo User',
                        email: user?.email || '',
                        riskProfile: data.risk_tolerance ? data.risk_tolerance.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Moderate',
                        income: data.income || 50000,
                        goals: data.goals || 'Retirement',
                        timeHorizon: data.time_horizon || '10+ years'
                    })
                }
            } catch (err) {
                console.error("Failed to fetch profile", err)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchProfile()
        } else {
            setLoading(false)
        }
    }, [user])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ text: '', type: '' })

        try {
            await api.patch('/profile', {
                name: formData.fullName,
                risk_tolerance: formData.riskProfile.toLowerCase(),
                income: formData.income,
                goals: formData.goals,
                time_horizon: formData.timeHorizon
            })
            setMessage({ text: 'Profile settings updated successfully.', type: 'success' })
        } catch (error) {
            setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' })
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="h-10 bg-[var(--color-surface-light)] rounded w-1/4"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="h-96 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]"></div>
                    <div className="lg:col-span-2 h-96 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Profile & Settings</h1>
                    <p className="text-[var(--color-text-muted)] text-sm">Manage your account preferences and risk profile.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">

                {/* Left Sidebar block */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] border border-[var(--color-surface-light)] p-6 shadow-lg flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-blue-600 flex items-center justify-center text-3xl font-bold text-gray-900 shadow-[0_0_20px_rgba(0,217,255,0.3)] mb-4 relative">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--color-surface-light)] rounded-full border border-[var(--color-surface)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-bg-base)] transition-colors">
                                <User size={12} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{formData.fullName}</h2>
                        <p className="text-[var(--color-text-muted)] text-sm">{formData.email}</p>
                    </div>
                </div>

                {/* Main Settings Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSave} className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] border border-[var(--color-surface-light)] shadow-lg overflow-hidden">
                        <div className="px-8 py-6 border-b border-[var(--color-surface-light)] flex justify-between items-center bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-surface-light)]/20">
                            <h3 className="font-bold text-lg text-white">Personal Information</h3>
                        </div>

                        <div className="p-8 space-y-6">
                            {message.text && (
                                <div className={`p-4 rounded-[var(--radius-button)] text-sm border font-medium flex items-center gap-3 ${message.type === 'success' ? 'bg-[var(--color-semantic-up)]/10 border-[var(--color-semantic-up)]/30 text-[var(--color-semantic-up)]' : 'bg-[var(--color-semantic-down)]/10 border-[var(--color-semantic-down)]/30 text-[var(--color-semantic-down)]'}`}>
                                    {message.type === 'success' ? <User size={18} /> : <AlertTriangle size={18} />}
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full h-12 bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-button)] px-4 text-white hover:border-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-200"
                                    />
                                </div>
                                <div className="space-y-2 flex-col">
                                    <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail size={16} className="text-[var(--color-text-muted)]" />
                                        </div>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled // Email changes usually require verification
                                            className="w-full h-12 bg-[var(--color-surface-light)]/50 border border-[var(--color-surface-light)] rounded-[var(--radius-button)] pl-10 pr-4 text-[var(--color-text-muted)] cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px bg-[var(--color-surface-light)] my-8"></div>

                            <h3 className="font-bold text-lg text-white mb-4">Risk Tolerance</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Current Profile</label>
                                <select
                                    value={formData.riskProfile}
                                    onChange={(e) => setFormData({ ...formData, riskProfile: e.target.value })}
                                    className="w-full h-12 bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-button)] px-4 text-white hover:border-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-200 appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23A0A0A0\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                                >
                                    <option value="Conservative">Conservative</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Aggressive">Aggressive</option>
                                    <option value="Very Aggressive">Very Aggressive</option>
                                </select>
                                <p className="text-[var(--color-text-muted)] text-sm mt-2">
                                    Your AI advisor uses this setting to tailor recommendations and monitor your portfolio's allocation drift.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Estimated Annual Income ($)</label>
                                    <input
                                        type="number"
                                        value={formData.income}
                                        onChange={(e) => setFormData({ ...formData, income: Number(e.target.value) })}
                                        className="w-full h-12 bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-button)] px-4 text-white hover:border-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Time Horizon</label>
                                    <select
                                        value={formData.timeHorizon}
                                        onChange={(e) => setFormData({ ...formData, timeHorizon: e.target.value })}
                                        className="w-full h-12 bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-button)] px-4 text-white hover:border-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-200 appearance-none cursor-pointer"
                                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23A0A0A0\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="1-3 years">1-3 years</option>
                                        <option value="3-5 years">3-5 years</option>
                                        <option value="5-10 years">5-10 years</option>
                                        <option value="10+ years">10+ years</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Primary Financial Goal</label>
                                <select
                                    value={formData.goals}
                                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                    className="w-full h-12 bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-button)] px-4 text-white hover:border-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-200 appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23A0A0A0\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                                >
                                    <option value="Retirement">Retirement</option>
                                    <option value="Wealth Accumulation">Wealth Accumulation</option>
                                    <option value="Debt Payoff">Debt Payoff</option>
                                    <option value="Purchasing a Home">Purchasing a Home</option>
                                    <option value="Education Savings">Education Savings</option>
                                </select>
                            </div>



                        </div>

                        <div className="px-8 py-5 border-t border-[var(--color-surface-light)] bg-[var(--color-bg-base)] flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-gray-900 rounded-[var(--radius-button)] font-bold transition-all duration-200 glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
