import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api.ts'
import { TrendingUp, TrendingDown, Activity, Search } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'

interface Holding {
    id: string
    symbol: string
    quantity: number
    avg_cost: number
    current_price?: number // Augmented via API
}

const COMMON_STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms, Inc.' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'PG', name: 'Procter & Gamble Co.' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'UNH', name: 'UnitedHealth Group' },
    { symbol: 'DIS', name: 'The Walt Disney Company' },
    { symbol: 'HD', name: 'The Home Depot, Inc.' },
    { symbol: 'BAC', name: 'Bank of America Corp' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'KO', name: 'The Coca-Cola Company' },
    { symbol: 'NFLX', name: 'Netflix, Inc.' },
    { symbol: 'PFE', name: 'Pfizer Inc.' },
    { symbol: 'MCD', name: 'McDonald\'s Corp' },
    { symbol: 'CSCO', name: 'Cisco Systems, Inc.' },
    { symbol: 'ABT', name: 'Abbott Laboratories' },
    { symbol: 'CRM', name: 'Salesforce, Inc.' },
    { symbol: 'PEP', name: 'PepsiCo, Inc.' },
    // Popular ETFs
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
    { symbol: 'ARKK', name: 'ARK Innovation ETF' },
    { symbol: 'VGT', name: 'Vanguard Information Tech ETF' },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF' },
    { symbol: 'GLD', name: 'SPDR Gold Shares' },
    // Popular Crypto
    { symbol: 'BTC-USD', name: 'Bitcoin USD' },
    { symbol: 'ETH-USD', name: 'Ethereum USD' },
    { symbol: 'SOL-USD', name: 'Solana USD' },
    { symbol: 'DOGE-USD', name: 'Dogecoin USD' }
]

export const Portfolio = () => {
    const [holdings, setHoldings] = useState<Holding[]>([])
    const [loading, setLoading] = useState(true)
    const [action, setAction] = useState<'buy' | 'sell'>('buy')
    const [symbol, setSymbol] = useState('')
    const [shares, setShares] = useState('')
    const [currentPrice, setCurrentPrice] = useState<number | null>(null)
    const [isFetchingPrice, setIsFetchingPrice] = useState(false)
    const [priceError, setPriceError] = useState('')
    const [historicalData, setHistoricalData] = useState<any[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Handle clicks outside of dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchPortfolio = async () => {
        try {
            const data = await api.get('/portfolio')

            // Ensure data is actually an array before mapping to prevent crash on 429/500 errors
            const safeData = Array.isArray(data) ? data : []

            // Mock augmentation for demo purposes if current_price is missing
            const augmentedData = safeData.map((h: Holding) => {
                const safeCost = h?.avg_cost || 0
                return {
                    ...h,
                    current_price: h?.current_price || safeCost * (1 + (Math.random() * 0.1 - 0.05)) // +/- 5%
                }
            })

            setHoldings(augmentedData)
        } catch (error) {
            console.error("Failed to fetch portfolio", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPortfolio()
    }, [])

    useEffect(() => {
        const fetchPrice = async () => {
            if (!symbol.trim() || symbol.trim().length > 10) {
                setCurrentPrice(null)
                setPriceError('')
                setHistoricalData([])
                return
            }

            setIsFetchingPrice(true)
            setPriceError('')

            try {
                const [msgData, histData] = await Promise.all([
                    api.get(`/market?symbol=${symbol}`),
                    api.get(`/market/history?symbol=${symbol}`).catch(() => ({ history: [] }))
                ])
                setCurrentPrice(msgData.currentPrice)
                setHistoricalData(histData.history || [])
            } catch (error) {
                setCurrentPrice(null)
                setPriceError('Symbol not found or unavailable')
                setHistoricalData([])
            } finally {
                setIsFetchingPrice(false)
            }
        }

        const timeoutId = setTimeout(() => {
            fetchPrice()
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [symbol])

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentPrice || parseFloat(shares) <= 0) return

        setSubmitting(true)
        setMessage({ text: '', type: '' })

        try {
            await api.post('/portfolio/transaction', {
                symbol: symbol.toUpperCase(),
                type: action,
                shares: parseFloat(shares),
                price: currentPrice
            })

            setMessage({ text: `Successfully processed ${action} for ${symbol.toUpperCase()}`, type: 'success' })
            setSymbol('')
            setShares('')
            setCurrentPrice(null)
            fetchPortfolio() // Refresh data
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Transaction failed. Please check inputs.'
            setMessage({ text: errorMessage, type: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const totalValue = holdings.reduce((acc, h) => acc + ((h?.quantity || 0) * (h?.current_price || h?.avg_cost || 0)), 0)
    const totalCost = holdings.reduce((acc, h) => acc + ((h?.quantity || 0) * (h?.avg_cost || 0)), 0)
    const totalReturn = totalValue - totalCost
    const returnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-[var(--color-surface-light)] rounded w-1/4"></div>
                <div className="h-32 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]"></div>
                <div className="h-64 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header & KPI */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Mock Portfolio</h1>
                    <p className="text-[var(--color-text-muted)] text-sm">Practice trading securely with live market data.</p>
                </div>

                <div className="flex gap-6">
                    <div className="text-right">
                        <div className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Total Value</div>
                        <div className="text-3xl font-bold text-white">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="w-px h-12 bg-[var(--color-surface-light)]"></div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Total Return</div>
                        <div className={`text-xl font-bold flex items-center justify-end gap-1 ${totalReturn >= 0 ? 'text-[var(--color-semantic-up)]' : 'text-[var(--color-semantic-down)]'}`}>
                            {totalReturn >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            ${Math.abs(totalReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-sm">({returnPercent > 0 ? '+' : ''}{returnPercent.toFixed(2)}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Holdings Asset Table */}
                <div className="lg:col-span-2 bg-[var(--color-surface)] rounded-[var(--radius-ui)] border border-[var(--color-surface-light)] shadow-lg overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-[var(--color-surface-light)] bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-surface-light)]/20">
                        <h3 className="font-bold text-lg text-white">Current Assets</h3>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--color-surface-light)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider bg-[var(--color-bg-base)]/50">
                                    <th className="px-6 py-4 font-medium">Asset</th>
                                    <th className="px-6 py-4 font-medium text-right">Quantity</th>
                                    <th className="px-6 py-4 font-medium text-right">Avg Cost</th>
                                    <th className="px-6 py-4 font-medium text-right">Current Price</th>
                                    <th className="px-6 py-4 font-medium text-right">Total Value</th>
                                    <th className="px-6 py-4 font-medium text-right">Return</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-surface-light)]">
                                {holdings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                                            Your portfolio is empty. Start by trading an asset!
                                        </td>
                                    </tr>
                                ) : (
                                    holdings.map((h) => {
                                        const cost = h?.avg_cost || 0
                                        const current = h?.current_price || cost
                                        const qty = h?.quantity || 0
                                        const value = qty * current
                                        const diff = current - cost
                                        const diffPercent = cost > 0 ? (diff / cost) * 100 : 0
                                        const isPositive = diff >= 0

                                        // Ensure symbol exists
                                        const displaySymbol = h?.symbol || 'UNK'

                                        return (
                                            <tr key={h.id} className="hover:bg-[var(--color-surface-light)]/50 transition-colors cursor-pointer group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-[var(--radius-ui)] bg-[var(--color-surface-light)] flex items-center justify-center font-bold text-sm text-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/10 transition-colors">
                                                            {displaySymbol.substring(0, 3)}
                                                        </div>
                                                        <span className="font-bold text-white tracking-wide">{displaySymbol}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-[var(--color-text-main)] font-medium">{qty.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                                                <td className="px-6 py-4 text-right text-[var(--color-text-muted)]">${cost.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-medium text-white">${current.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-bold text-white">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className={`px-6 py-4 text-right font-medium flex items-center justify-end gap-1 ${isPositive ? 'text-[var(--color-semantic-up)]' : 'text-[var(--color-semantic-down)]'}`}>
                                                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                    {isPositive ? '+' : ''}{diffPercent.toFixed(2)}%
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Trading Desk */}
                <div className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] border border-[var(--color-surface-light)] shadow-lg p-6 h-fit sticky top-24">
                    <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
                        <Activity size={20} className="text-[var(--color-accent)]" />
                        <h3>Trade Asset</h3>
                    </div>

                    <div className="flex bg-[var(--color-bg-base)] rounded-[var(--radius-button)] p-1 mb-6 border border-[var(--color-surface-light)]">
                        <button
                            className={`flex-1 py-2 font-bold text-sm rounded-[var(--radius-button)] transition-all duration-200 ${action === 'buy' ? 'bg-[var(--color-semantic-up)] text-gray-900 shadow-lg' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                            onClick={() => setAction('buy')}
                        >Buy</button>
                        <button
                            className={`flex-1 py-2 font-bold text-sm rounded-[var(--radius-button)] transition-all duration-200 ${action === 'sell' ? 'bg-[var(--color-semantic-down)] text-white shadow-lg' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                            onClick={() => setAction('sell')}
                        >Sell</button>
                    </div>

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-[var(--radius-ui)] text-sm border font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-[var(--color-semantic-up)]/10 border-[var(--color-semantic-up)]/30 text-[var(--color-semantic-up)]' : 'bg-[var(--color-semantic-down)]/10 border-[var(--color-semantic-down)]/30 text-[var(--color-semantic-down)]'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleTransaction} className="space-y-4">
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Symbol</label>
                            <div className="relative">
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. AAPL, BTC-USD, SPY"
                                    value={symbol}
                                    onChange={(e) => {
                                        setSymbol(e.target.value.toUpperCase())
                                        setShowDropdown(true)
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="w-full h-11 bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-button)] pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-200 uppercase placeholder:normal-case placeholder:text-gray-600 mb-2"
                                />
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                            </div>

                            {showDropdown && symbol.trim().length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-[var(--radius-button)] shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                                    {COMMON_STOCKS.filter(s =>
                                        s.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
                                        s.name.toLowerCase().includes(symbol.toLowerCase())
                                    ).length > 0 ? (
                                        COMMON_STOCKS.filter(s =>
                                            s.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
                                            s.name.toLowerCase().includes(symbol.toLowerCase())
                                        ).map((s) => (
                                            <button
                                                key={s.symbol}
                                                type="button"
                                                className="w-full px-4 py-3 text-left hover:bg-[var(--color-surface-light)] transition-colors flex items-center justify-between border-b border-[var(--color-surface-light)]/50 last:border-0"
                                                onClick={() => {
                                                    setSymbol(s.symbol)
                                                    setShowDropdown(false)
                                                }}
                                            >
                                                <span className="font-bold text-white">{s.symbol}</span>
                                                <span className="text-xs text-[var(--color-text-muted)] truncate max-w-[200px]">{s.name}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-[var(--color-text-muted)] italic">
                                            Auto-searching "{symbol}" via Yahoo Finance...
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="h-6 flex items-center justify-between text-xs px-1">
                                {isFetchingPrice && <span className="text-[var(--color-accent)] animate-pulse">Fetching live data...</span>}
                                {priceError && !isFetchingPrice && <span className="text-[var(--color-semantic-down)]">{priceError}</span>}
                                {currentPrice && !isFetchingPrice && !priceError && (
                                    <span className="text-white font-medium">
                                        Market Price: <span className="text-[var(--color-semantic-up)]">${currentPrice.toFixed(2)}</span>
                                    </span>
                                )}
                            </div>

                            {historicalData.length > 0 && !isFetchingPrice && !priceError && (
                                <div className="w-full h-40 bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-button)] mt-2 overflow-hidden px-1 pt-4 pb-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={historicalData}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="date" hide />
                                            <YAxis domain={['dataMin', 'dataMax']} hide />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'var(--color-surface-light)', border: 'none', borderRadius: '4px', fontSize: '12px' }}
                                                itemStyle={{ color: '#fff' }}
                                                labelStyle={{ color: 'var(--color-text-muted)' }}
                                            />
                                            <Area type="monotone" dataKey="price" stroke="#00D9FF" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Shares</label>
                                <input
                                    required
                                    type="number"
                                    step="any"
                                    min="0.0001"
                                    placeholder="0.0"
                                    value={shares}
                                    onChange={(e) => setShares(e.target.value)}
                                    className="w-full h-11 bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-button)] px-4 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-200 placeholder:text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Est. Total ($)</label>
                                <div className="w-full h-11 bg-[var(--color-bg-base)]/50 border border-[var(--color-surface-light)]/50 rounded-[var(--radius-button)] px-4 flex items-center text-[var(--color-text-muted)] font-medium">
                                    {currentPrice && shares ? `$${(currentPrice * parseFloat(shares)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || isFetchingPrice || !currentPrice || !shares}
                            className={`w-full h-12 font-bold rounded-[var(--radius-button)] transition-all duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed text-base ${action === 'buy'
                                ? 'bg-[var(--color-semantic-up)] hover:bg-[#00E676] text-gray-900 shadow-[0_0_15px_rgba(0,200,83,0.3)]'
                                : 'bg-[var(--color-semantic-down)] hover:bg-[#FF5252] text-white shadow-[0_0_15px_rgba(255,61,0,0.3)]'
                                }`}
                        >
                            {submitting ? 'Processing...' : `Confirm ${action === 'buy' ? 'Purchase' : 'Sale'}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
