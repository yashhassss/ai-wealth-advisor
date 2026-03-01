import { useState, useEffect } from 'react'
import { BookOpen, PlayCircle, FileText, ArrowRight, Clock, Star } from 'lucide-react'

interface Article {
    id: string
    title: string
    category: string
    summary: string
    content?: string
    readTime: string
    type: 'article' | 'video'
    featured?: boolean
    videoUrl?: string
}

export const Education = () => {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Mock data loading with comprehensive deep content
        setTimeout(() => {
            setArticles([
                {
                    id: '1',
                    title: 'Understanding Advanced Asset Allocation',
                    category: 'Investing 101',
                    summary: 'Learn how to balance your portfolio to match your exact risk tolerance using modern portfolio theory.',
                    content: 'Asset allocation is an investment strategy that aims to balance risk and reward by apportioning a portfolio\'s assets according to an individual\'s goals, risk tolerance, and investment horizon.\n\nThe three main asset classes - equities, fixed-income, and cash and equivalents - have different levels of risk and return, so each will behave differently over time.\n\nThere is no simple formula that can find the right asset allocation for every individual. However, the consensus among most financial professionals is that asset allocation is one of the most important decisions that investors make. In other words, your selection of individual securities is secondary to the way you allocate your investment in stocks, bonds, and cash and equivalents, which will be the principal determinants of your investment results.\n\n### Why Asset Allocation Is Important\n\nAsset allocation is a core tenet of modern portfolio theory (MPT). It is widely believed that different asset classes offer returns that are not perfectly correlated, hence diversification reduces the overall risk in terms of the variability of returns for a given level of expected return.\n\nHaving an asset allocation tailored to your goals provides peace of mind. Without a strong allocation framework, investors are prone to emotional decision making, leading them to buy at market peaks and sell at market bottoms. A strategic mix prevents these severe behavioral blunders.\n\n### Strategic Asset Allocation\n\nStrategic Asset Allocation (SAA) is the traditional approach, where you establish a baseline policy mix based on expected returns for each asset class. Once the target allocation is set, you periodically rebalance back to those exact percentages, effectively forcing you to sell high and buy low.\n\n### Tactical Asset Allocation\n\nTactical Asset Allocation (TAA) allows for a range of percentages in each asset class (e.g. 40-50% in equities). This permits the investor to tactically shift the balance to take advantage of unusual or exceptional investment opportunities, while fundamentally remaining anchored to the strategic objective.',
                    readTime: '10 min read',
                    type: 'article',
                    featured: true
                },
                {
                    id: '2',
                    title: 'How The Economic Machine Works',
                    category: 'Economics',
                    summary: 'A deep dive into how economic cycles operate, driven by productivity, short term debt, and long term debt cycles.',
                    content: 'In this animated video, billionaire investor Ray Dalio breaks down the fundamental concepts of how the economy works. He explains the three main forces that drive the economy: productivity growth, the short-term debt cycle, and the long-term debt cycle.\n\nBy understanding these three forces, investors can better navigate market volatility and recognize when the market is entering a recessionary or inflationary period. Learning how credit acts as the primary engine for economic expansion is crucial for any long-term investor.',
                    readTime: '30 min video',
                    type: 'video',
                    videoUrl: 'https://www.youtube.com/embed/PHe0bXAIuk0'
                },
                {
                    id: '3',
                    title: 'Intro to Cryptocurrency Markets',
                    category: 'Crypto',
                    summary: 'Understanding Bitcoin, Ethereum, and how blockchain technology underpins decentralized finance.',
                    content: 'A cryptocurrency is a digital or virtual currency that is secured by cryptography, which makes it nearly impossible to counterfeit or double-spend. Many cryptocurrencies are decentralized networks based on blockchain technology—a distributed ledger enforced by a disparate network of computers.\n\nA defining feature of cryptocurrencies is that they are generally not issued by any central authority, rendering them theoretically immune to government interference or manipulation.\n\n### The Role of Bitcoin\n\nBitcoin was created after the 2008 financial crisis as a trustless, peer-to-peer form of digital cash. Today, it behaves closer to "digital gold", acting as a macroeconomic hedge and a specialized risk-asset. The underlying technology known as the blockchain relies on miners to validate transactions without needing a centralized bank.\n\nWatch the video below to get a 5-minute crash course on how the Bitcoin network operates securely without a central leader.',
                    readTime: '5 min video',
                    type: 'video',
                    videoUrl: 'https://www.youtube.com/embed/bBC-nXj3Ng4'
                },
                {
                    id: '4',
                    title: 'Tax-Loss Harvesting Explained',
                    category: 'Tax Strategy',
                    summary: 'How selling assets at a loss can actually improve your after-tax financial position at year end.',
                    content: 'Tax-loss harvesting is the selling of securities at a loss to offset a capital gains tax liability. This strategy is typically employed to limit the amount of taxes due on short-term capital gains, which are generally taxed at a higher rate than long-term capital gains.\n\nHowever, the strategy can also offset long-term capital gains. While tax-loss harvesting cannot restore your losses, it can soften the blow.\n\n### The Wash-Sale Rule\n\nInvestors must be aware of the "wash-sale rule" enforced by the IRS. A wash sale occurs when an investor sells a security at a loss and then buys the same or a "substantially identical" security within 30 days before or after the sale. If a wash sale occurs, the IRS will not allow the investor to claim the tax loss.\n\nTo effectively tax-loss harvest, an investor must select a proxy asset that mimics the original asset\'s performance without triggering the wash sale rule. For example, selling the SPY ETF at a loss and immediately buying the VOO ETF, since they track the same index but are managed by different companies.\n\n### Offset Limits and Carryovers\n\nIf your capital losses exceed your capital gains, you can use up to $3,000 of those losses to offset ordinary income (like your salary) for the year. Any losses beyond that $3,000 limit can be carried over conceptually forever to future tax years, serving as a powerful tax shield over your lifetime.\n\n### Automated Harvesting vs Manual Harvesting\n\nMany modern robo-advisors automatically harvest losses constantly throughout the year on your behalf by scanning for daily dips. However, if you manage your own portfolio, it is recommended to review your taxable positions in November or December to lock in any unrealized losses before the tax year officially closes.',
                    readTime: '8 min read',
                    type: 'article'
                },
                {
                    id: '5',
                    title: 'Evaluating Company Fundamentals',
                    category: 'Stock Picking',
                    summary: 'Learn to read balance sheets, income statements, and cash flow reports like a professional analyst.',
                    content: 'Fundamental analysis is a method of determining a stock\'s real or "fair market" value. Fundamental analysts search for stocks that are currently trading at prices that are higher or lower than their real value.\n\nIf the fair market value is higher than the market price, the stock is deemed to be undervalued and a buy recommendation is given. In contrast, technical analysts ignore the fundamentals in favor of studying the historical price trends of the stock.\n\n### Reading the Income Statement\n\nThe income statement shows a company\'s financial performance over a specific accounting period. It gives you a summary of how the business incurs its revenues and expenses through both operating and non-operating activities. The "Top Line" refers to total revenue, while the "Bottom Line" refers to Net Income after all expenses and taxes have been deducted.\n\n### Balance Sheet Basics\n\nA balance sheet provides a snapshot of a company\'s financial health at a precise moment in time. It is structured around the fundamental equation: Assets = Liabilities + Shareholder\'s Equity. Strong companies typically have ample cash reserves (Assets) that dwarf their short-term debt obligations (Liabilities).\n\n### Key Metrics\n\n- **P/E Ratio (Price-to-Earnings)**: Measures the current trading price against the company\'s trailing earnings per share. A high P/E suggests investors expect higher earnings growth in the future.\n- **P/B Ratio (Price-to-Book)**: Compares the market valuation to the book value of the company\'s assets minus liabilities.\n- **Free Cash Flow (FCF)**: The cash a company produces through its operations, minus the cost of expenditures on assets. FCF is the true lifeblood of any business.\n- **Return on Equity (ROE)**: Measures how effectively management is using a company\'s assets to create profits. A high ROE usually denotes a company with a strong economic moat.\n\n### The Economic Moat\n\nCoined by Warren Buffett, an "economic moat" refers to a business\'s ability to maintain competitive advantages over its competitors in order to protect its long-term profits and market share from competing firms. Moats can come in the form of high switching costs, intangible IP assets, network effects, or massive cost advantages.',
                    readTime: '15 min read',
                    type: 'article'
                },
                {
                    id: '6',
                    title: 'The Stock Market Explained',
                    category: 'Investing 101',
                    summary: 'A visual breakdown of what the stock market is, how shares work, and why companies go public.',
                    content: 'The stock market refers to the collection of markets and exchanges where regular activities of buying, selling, and issuance of shares of publicly-held companies take place. Such financial activities are conducted through institutionalized formal exchanges or over-the-counter (OTC) marketplaces which operate under a defined set of regulations.\n\nBut what does it actually mean to own a stock? When you buy a share, you are purchasing a fractional piece of ownership in that business. If the business profits and grows, the value of your piece grows. If the business goes bankrupt, your piece becomes worthless.\n\nWatch this visual explainer to understand the core mechanics of how Wall Street operates.',
                    readTime: '4 min video',
                    type: 'video',
                    videoUrl: 'https://www.youtube.com/embed/ZCFkWDdmXG8'
                }
            ])
            setLoading(false)
        }, 500)
    }, [])

    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
    const featured = articles.find(a => a.featured)
    const standardArticles = articles.filter(a => !a.featured)

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-[var(--color-surface-light)] rounded w-1/4 mb-8"></div>
                <div className="h-64 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)] mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-[var(--color-surface-light)] rounded-[var(--radius-ui)]"></div>
                    ))}
                </div>
            </div>
        )
    }

    if (selectedArticle) {
        return (
            <div className="space-y-8 max-w-4xl mx-auto">
                <button
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                    <ArrowRight size={16} className="rotate-180" /> Back to Education Center
                </button>

                <div className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] border border-[var(--color-surface-light)] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        {selectedArticle.type === 'video' ? <PlayCircle size={120} /> : <FileText size={120} />}
                    </div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <span className="px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 text-xs font-bold uppercase tracking-wider rounded-[var(--radius-button)]">
                            {selectedArticle.category}
                        </span>
                        <span className="text-sm font-medium text-[var(--color-text-muted)] flex items-center gap-1.5">
                            <Clock size={16} /> {selectedArticle.readTime}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight relative z-10">
                        {selectedArticle.title}
                    </h1>

                    <div className="w-full h-px bg-[var(--color-surface-light)] my-8"></div>

                    {selectedArticle.type === 'video' && selectedArticle.videoUrl ? (
                        <div className="w-full aspect-video bg-[#000] border border-[var(--color-surface-light)] rounded-[var(--radius-ui)] mb-8 overflow-hidden relative shadow-lg z-20">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={selectedArticle.videoUrl}
                                title={selectedArticle.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : selectedArticle.type === 'video' && (
                        <div className="w-full aspect-video bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-ui)] mb-8 flex items-center justify-center cursor-pointer hover:border-[var(--color-accent)]/50 group transition-all z-20 relative">
                            <PlayCircle size={64} className="text-[var(--color-accent)] opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all" />
                        </div>
                    )}

                    <div className="prose prose-invert prose-p:text-[var(--color-text-muted)] prose-p:leading-relaxed max-w-none relative z-10 text-lg space-y-6">
                        {/* Fake rendering line breaks as separate paragraphs */}
                        {(selectedArticle.content || '').split('\n\n').map((paragraph: string, i: number) => {
                            if (paragraph.startsWith('###')) {
                                return <h3 key={i} className="text-2xl font-bold text-white mt-8 mb-4">{paragraph.replace('###', '').trim()}</h3>
                            }
                            if (paragraph.startsWith('- ')) {
                                return (
                                    <ul key={i} className="list-disc pl-6 space-y-2 text-[var(--color-text-muted)]">
                                        {paragraph.split('\n').map((item, j) => (
                                            <li key={j} className="text-lg">
                                                {/* Super basic bold parsing for lists */}
                                                <span dangerouslySetInnerHTML={{ __html: item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                                            </li>
                                        ))}
                                    </ul>
                                )
                            }
                            return <p key={i}>{paragraph}</p>
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Financial Education Center</h1>
                    <p className="text-[var(--color-text-muted)] text-sm">Expand your knowledge with curated courses and articles.</p>
                </div>
            </div>

            {/* Featured Article/Course */}
            {featured && (
                <div
                    onClick={() => setSelectedArticle(featured)}
                    className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg-base)] rounded-[var(--radius-ui)] border border-[var(--color-surface-light)] shadow-2xl overflow-hidden relative group cursor-pointer h-auto sm:h-72 flex flex-col sm:flex-row"
                >
                    <div className="absolute inset-0 bg-[var(--color-accent)]/5 group-hover:bg-[var(--color-accent)]/10 transition-colors pointer-events-none z-10"></div>

                    <div className="sm:w-2/5 md:w-1/3 bg-[var(--color-surface-light)]/50 relative overflow-hidden flex items-center justify-center p-8">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/20 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -translate-x-5 translate-y-5"></div>

                        <BookOpen size={64} className="text-[var(--color-accent)] relative z-20 opacity-80 group-hover:scale-110 transition-transform duration-500 delay-100" />
                    </div>

                    <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center relative z-20">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-[var(--color-accent)] text-gray-900 text-xs font-bold uppercase tracking-wider rounded-[var(--radius-button)] shadow-[0_0_10px_rgba(0,217,255,0.3)]">Featured</span>
                            <span className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1.5"><Clock size={14} /> {featured.readTime}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-[var(--color-accent)] transition-colors leading-tight">{featured.title}</h2>
                        <p className="text-[var(--color-text-muted)] mb-6 max-w-2xl leading-relaxed">{featured.summary}</p>
                        <div className="mt-auto flex items-center gap-2 text-[var(--color-accent)] font-bold text-sm">
                            Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            )}

            {/* Content Grid */}
            <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Star size={20} className="text-[var(--color-accent)]" />
                    Latest Content
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {standardArticles.map(article => (
                        <div
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="bg-[var(--color-surface)] rounded-[var(--radius-ui)] border border-[var(--color-surface-light)] p-6 hover:border-[var(--color-accent)]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 group cursor-pointer flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                {article.type === 'video' ? <PlayCircle size={48} className="text-[var(--color-accent)]" /> : <FileText size={48} className="text-[var(--color-accent)]" />}
                            </div>

                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <span className="px-2.5 py-1 bg-[var(--color-surface-light)] text-[var(--color-text-main)] text-xs font-semibold rounded-[var(--radius-button)] border border-[var(--color-surface-light)]/50 group-hover:bg-[var(--color-accent)]/10 group-hover:text-[var(--color-accent)] group-hover:border-[var(--color-accent)]/20 transition-colors">
                                    {article.category}
                                </span>
                            </div>

                            <h4 className="text-lg font-bold text-white mb-3 group-hover:text-[var(--color-accent)] transition-colors relative z-10 line-clamp-2">
                                {article.title}
                            </h4>

                            <p className="text-[var(--color-text-muted)] text-sm mb-6 flex-1 line-clamp-3 relative z-10">
                                {article.summary}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-[var(--color-surface-light)] relative z-10">
                                <span className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1.5">
                                    <Clock size={14} /> {article.readTime}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-light)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:bg-[var(--color-accent)] group-hover:text-gray-900 transition-colors">
                                    {article.type === 'video' ? <PlayCircle size={16} /> : <ArrowRight size={16} />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
