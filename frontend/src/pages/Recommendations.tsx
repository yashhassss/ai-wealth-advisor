import { useState, useEffect } from 'react'
import { api } from '../services/api.ts'
import { Activity, ShieldAlert, Target } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'

interface Recommendation {
    id: string
    asset: string
    type: 'buy' | 'sell' | 'hold'
    reason: string
    confidence: number
}

export const Recommendations = () => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [allocation, setAllocation] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [prices, setPrices] = useState<Record<string, number>>({})

    useEffect(() => {
        if (recommendations.length > 0) {
            recommendations.forEach(async (rec) => {
                try {
                    const data = await api.get(`/market?symbol=${rec.asset}`)
                    if (data?.currentPrice) {
                        setPrices(prev => ({ ...prev, [rec.asset]: data.currentPrice }))
                    }
                } catch (e) {
                    console.error("Failed fetching price for", rec.asset)
                }
            })
        }
    }, [recommendations])

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // Mock Fetch or actual API call if ready
                const data = await api.get('/recommendations')
                setRecommendations(data?.recommendations || [
                    { id: '1', asset: 'VTI', type: 'buy', reason: 'Broad market trend aligns with moderate risk profile. High expected long-term return.', confidence: 85 },
                    { id: '2', asset: 'BTC', type: 'hold', reason: 'High volatility detected. Current allocation matches target, no action needed.', confidence: 70 },
                    { id: '3', asset: 'BND', type: 'buy', reason: 'Adding bonds to stabilize portfolio during current market turbulence.', confidence: 92 },
                    { id: '4', asset: 'TSLA', type: 'sell', reason: 'Asset has become extremely overweight in context of personal risk profile.', confidence: 60 }
                ])
                setAllocation(data?.allocation || [
                    { name: 'Broad ETFs (VTI)', value: 60, color: '#00D9FF' },
                    { name: 'Bonds (BND)', value: 30, color: '#8b5cf6' },
                    { name: 'Crypto (BTC)', value: 10, color: '#FF9F00' }
                ])
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchRecommendations()
    }, [])

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-[var(--color-surface-light)] rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">AI Recommendations</h1>
                    <p className="text-[var(--color-text-muted)] text-sm">Actionable insights from your personalized advisor based on current market conditions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Target Allocation Model */}
                <div className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] p-6 border border-[var(--color-surface-light)] shadow-lg lg:col-span-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)] text-[var(--color-accent)]">
                            <Target size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-white">Recommended Allocation</h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">
                        A dynamic mix of ETFs, index funds, and stocks tailored perfectly to your onboarding profile.
                    </p>

                    <div className="flex-1 w-full min-h-[220px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocation}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {allocation.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'var(--color-surface-light)', border: 'none', borderRadius: 'var(--radius-ui)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 space-y-3">
                        {allocation.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-[var(--color-text-muted)] font-medium">{item.name}</span>
                                </div>
                                <span className="font-bold text-white">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Specific Asset Recommendations */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
                    {recommendations.map((rec) => (
                        <div
                            key={rec.id}
                            className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] p-6 border border-[var(--color-surface-light)] shadow-lg hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface-light)]/20 transition-all duration-200 flex flex-col h-full relative overflow-hidden"
                        >
                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-accent)]/10 transition-colors"></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-[var(--radius-button)] bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] flex items-center justify-center font-bold text-lg text-white shadow-sm">
                                        {rec.asset}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white tracking-wide">{rec.asset}</div>
                                        <div className="text-xs font-medium text-[var(--color-text-muted)]">
                                            {prices[rec.asset] ? `$${prices[rec.asset].toFixed(2)}` : 'Fetching...'}
                                        </div>
                                    </div>
                                </div>

                                <div className={`px-3 py-1 rounded-[var(--radius-button)] text-xs font-bold uppercase tracking-wider border ${rec.type === 'buy' ? 'bg-[var(--color-semantic-up)]/10 text-[var(--color-semantic-up)] border-[var(--color-semantic-up)]/20' :
                                    rec.type === 'sell' ? 'bg-[var(--color-semantic-down)]/10 text-[var(--color-semantic-down)] border-[var(--color-semantic-down)]/20' :
                                        'bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)] border-[var(--color-text-muted)]/20'
                                    }`}>
                                    {rec.type}
                                </div>
                            </div>

                            <div className="flex-1 relative z-10">
                                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed line-clamp-3">
                                    {rec.reason}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[var(--color-surface-light)] flex justify-start items-center relative z-10">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-[var(--color-accent)]" />
                                    <div className="text-xs font-medium">
                                        <span className="text-white">{rec.confidence}%</span> <span className="text-[var(--color-text-muted)]">AI Confidence</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 p-4 bg-[var(--color-semantic-warn)]/10 border border-[var(--color-semantic-warn)]/20 rounded-[var(--radius-ui)] flex items-start gap-3">
                <ShieldAlert className="text-[var(--color-semantic-warn)] flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-[var(--color-text-muted)]">
                    <strong className="text-white font-medium block mb-1">Disclaimer</strong>
                    These recommendations are generated by an AI model for educational and simulation purposes within this platform. Do not use this information for actual financial trading.
                </div>
            </div>
        </div>
    )
}
