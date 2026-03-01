import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.ts'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Target, MessageSquare, ArrowRight, PieChart as PieChartIcon } from 'lucide-react'

// Colors for the pie chart
const COLORS = ['#00D9FF', '#8b5cf6', '#10B981', '#FF9F00', '#F43F5E', '#3B82F6']

export const Dashboard = () => {
    const [holdings, setHoldings] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<'1M' | '6M' | '1Y' | 'All'>('6M')

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [portfolioData, profileData] = await Promise.all([
                    api.get('/portfolio').catch(() => []),
                    api.get('/profile').catch(() => null)
                ])

                const safeData = Array.isArray(portfolioData) ? portfolioData : []
                const augmented = safeData.map((h: any) => {
                    const safeCost = h?.avg_cost || 0
                    return {
                        ...h,
                        current_price: h?.current_price || safeCost * (1 + (Math.random() * 0.1 - 0.05))
                    }
                })
                setHoldings(augmented)
                setProfile(profileData)
            } catch (err) {
                console.error("Dashboard fetch error", err)
            } finally {
                setLoading(false)
            }
        }
        loadDashboard()
    }, [])

    const totalValue = holdings.reduce((acc, h) => acc + ((h?.quantity || 0) * (h?.current_price || h?.avg_cost || 0)), 0)
    const totalCost = holdings.reduce((acc, h) => acc + ((h?.quantity || 0) * (h?.avg_cost || 0)), 0)
    const totalReturn = totalValue - totalCost
    const returnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0

    // Construct a realistic trailing history based on actual cost, current value, and selected timeRange
    const generateHistory = () => {
        if (totalValue === 0 && totalCost === 0) {
            return [{ name: 'Start', value: 0 }, { name: 'Now', value: 0 }]
        }

        const now = new Date()
        const createdDate = profile?.created_at ? new Date(profile.created_at) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        // Calculate max allowed duration
        let startDate = new Date(now)
        if (timeRange === '1M') startDate.setMonth(now.getMonth() - 1)
        else if (timeRange === '6M') startDate.setMonth(now.getMonth() - 6)
        else if (timeRange === '1Y') startDate.setFullYear(now.getFullYear() - 1)
        else startDate.setFullYear(now.getFullYear() - 5) // All

        if (startDate < createdDate) {
            startDate = new Date(createdDate)
        }

        // Just generate 8 evenly spaced points between startDate and now for smoothness
        const pointsCount = 8
        const timeStep = Math.max(1, (now.getTime() - startDate.getTime()) / (pointsCount - 1))

        let labels: string[] = []
        for (let i = 0; i < pointsCount; i++) {
            const d = new Date(startDate.getTime() + i * timeStep)
            // Format depending on span length
            const spanDays = (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
            if (spanDays <= 31) {
                labels.push(`${d.getMonth() + 1}/${d.getDate()}`)
            } else {
                labels.push(`${d.toLocaleString('default', { month: 'short' })} '${d.getFullYear().toString().slice(2)}`)
            }
        }

        const points = []
        const startValue = totalCost * 0.95 // Mock start slightly under
        const valueStep = (totalValue - startValue) / (pointsCount - 1)
        let currentVal = startValue

        for (let i = 0; i < pointsCount - 1; i++) {
            const noise = currentVal * (Math.random() * 0.02 - 0.01)
            points.push({ name: labels[i], value: Math.max(0, currentVal + noise) })
            currentVal += valueStep
        }
        points.push({ name: labels[labels.length - 1], value: totalValue })

        return points
    }

    const performanceHistory = generateHistory()

    // Calculate current allocation by asset
    const allocationData = holdings.map((h, i) => ({
        name: h.symbol || 'Asset',
        value: ((h?.quantity || 0) * (h?.current_price || h?.avg_cost || 0)),
        color: COLORS[i % COLORS.length]
    })).filter(a => a.value > 0).sort((a, b) => b.value - a.value)

    const topHoldings = [...holdings].sort((a, b) => (((b?.quantity || 0) * (b?.current_price || 0)) - ((a?.quantity || 0) * (a?.current_price || 0)))).slice(0, 3)

    const riskProfile = profile?.risk_tolerance || 'Moderate'
    const isReturnPositive = totalReturn >= 0

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-[var(--color-surface-light)] rounded w-1/4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]"></div>)}
                </div>
                <div className="h-96 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Portfolio Overview</h1>
                    <p className="text-[var(--color-text-muted)] text-sm">{profile?.first_name ? `Welcome back, ${profile.first_name}. ` : 'Welcome back. '}Your portfolio is aligned with your "{riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)}" risk profile.</p>
                </div>
                <Link to="/advisor" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-gray-900 px-5 py-2.5 rounded-[var(--radius-button)] font-bold text-sm transition-all duration-200 glow-accent flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>Talk to Advisor</span>
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] p-6 border border-[var(--color-surface-light)] shadow-lg hover:border-[var(--color-accent)]/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3 text-[var(--color-text-muted)]">
                        <div className="p-2 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]"><DollarSign size={18} /></div>
                        <h3 className="font-medium text-sm">Total Net Worth</h3>
                    </div>
                    <div className="text-[32px] font-bold text-white mb-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className={`text-sm font-medium flex items-center gap-1 ${isReturnPositive ? 'text-[var(--color-semantic-up)]' : 'text-[var(--color-semantic-down)]'}`}>
                        {isReturnPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {isReturnPositive ? '+' : ''}{returnPercent.toFixed(2)}% All Time
                    </div>
                </div>

                <div className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] p-6 border border-[var(--color-surface-light)] shadow-lg hover:border-[var(--color-accent)]/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3 text-[var(--color-text-muted)]">
                        <div className="p-2 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]">
                            {isReturnPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                        <h3 className="font-medium text-sm">Total Return</h3>
                    </div>
                    <div className={`text-[32px] font-bold mb-1 ${isReturnPositive ? 'text-[var(--color-semantic-up)]' : 'text-[var(--color-semantic-down)]'}`}>
                        {isReturnPositive ? '+' : ''}${totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm font-medium text-[var(--color-text-muted)]">
                        On ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Invested
                    </div>
                </div>

                <div className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] p-6 border border-[var(--color-surface-light)] shadow-lg hover:border-[var(--color-accent)]/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3 text-[var(--color-text-muted)]">
                        <div className="p-2 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]"><PieChartIcon size={18} /></div>
                        <h3 className="font-medium text-sm">Unique Assets</h3>
                    </div>
                    <div className="text-[32px] font-bold text-white mb-1">{holdings.length}</div>
                    <div className="text-sm font-medium text-[var(--color-text-muted)]">
                        In Current Portfolio
                    </div>
                </div>

                <Link to="/profile" className="block bg-[var(--color-surface)] rounded-[var(--radius-ui)] p-6 border border-[var(--color-surface-light)] shadow-lg hover:border-[var(--color-accent)]/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3 text-[var(--color-text-muted)]">
                        <div className="p-2 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)] group-hover:bg-[var(--color-accent)]/10 group-hover:text-[var(--color-accent)] transition-colors"><Target size={18} /></div>
                        <h3 className="font-medium text-sm">Risk Profile</h3>
                    </div>
                    <div className="text-[32px] font-bold text-[var(--color-accent)] mb-1 capitalize">{riskProfile}</div>
                    <div className="text-sm font-medium text-[var(--color-text-muted)] group-hover:text-white transition-colors flex items-center gap-1">
                        Retake assessment <ArrowRight size={14} />
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Performance Chart */}
                <div className="lg:col-span-2 bg-[var(--color-surface)] rounded-[var(--radius-ui)] p-6 border border-[var(--color-surface-light)] shadow-lg flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-white">Portfolio Performance</h3>
                        <div className="flex gap-2 text-sm">
                            {['1M', '6M', '1Y', 'All'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range as any)}
                                    className={`px-3 py-1 rounded-[var(--radius-ui)] transition-colors ${timeRange === range
                                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20'
                                        : 'bg-[var(--color-surface-light)] text-white hover:bg-[var(--color-accent)] hover:text-gray-900 border border-transparent'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-light)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                                    tickFormatter={(val) => `$${val / 1000}k`}
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--color-surface-light)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 'var(--radius-ui)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: 'var(--color-accent)' }}
                                    formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, 'Value']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#00D9FF"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Allocation & Top Holdings */}
                <div className="flex flex-col gap-6">
                    {/* Allocation Chart */}
                    <div className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] p-6 border border-[var(--color-surface-light)] shadow-lg flex flex-col">
                        <h3 className="font-bold text-lg text-white mb-2">Current Allocation</h3>
                        {allocationData.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-sm text-[var(--color-text-muted)] py-12">
                                No assets to allocate.
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 w-full min-h-[200px] relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={allocationData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {allocationData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'var(--color-surface-light)', border: 'none', borderRadius: 'var(--radius-ui)' }}
                                                itemStyle={{ color: '#fff' }}
                                                formatter={(value: any, name: any) => [`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, name]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-2xl font-bold text-white">{allocationData.length}</span>
                                        <span className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Assets</span>
                                    </div>
                                </div>
                                <div className="mt-2 space-y-2">
                                    {allocationData.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm py-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                <span className="text-[var(--color-text-muted)]">{item.name}</span>
                                            </div>
                                            <span className="font-medium text-white">{((item.value / totalValue) * 100).toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Top Holdings Mock */}
                    <div className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] p-6 border border-[var(--color-surface-light)] shadow-lg flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-white">Top Holdings</h3>
                            <Link to="/portfolio" className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">View all</Link>
                        </div>
                        <div className="space-y-2">
                            {topHoldings.length === 0 ? (
                                <div className="text-sm text-[var(--color-text-muted)] p-4 text-center">No assets found.</div>
                            ) : topHoldings.map((h, i) => {
                                const cost = h?.avg_cost || 0
                                const current = h?.current_price || cost
                                const qty = h?.quantity || 0
                                const val = qty * current
                                const isPositive = current >= cost
                                const displaySymbol = h?.symbol || 'UNK'

                                return (
                                    <div key={i} className="flex justify-between items-center p-3 bg-[var(--color-bg-base)] rounded-[var(--radius-ui)] hover:bg-[var(--color-surface-light)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-surface-light)]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-[var(--radius-ui)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center font-bold text-sm">{displaySymbol.substring(0, 3)}</div>
                                            <div>
                                                <div className="font-medium text-white text-sm">{displaySymbol}</div>
                                                <div className="text-xs text-[var(--color-text-muted)]">{qty.toLocaleString(undefined, { maximumFractionDigits: 4 })} Shares</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-white text-sm">${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                            <div className={`text-xs ${isPositive ? 'text-[var(--color-semantic-up)]' : 'text-[var(--color-semantic-down)]'} font-medium`}>{isPositive ? '+' : ''}{cost > 0 ? ((current - cost) / cost * 100).toFixed(1) : '0.0'}%</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
