import { useState, useRef, useEffect } from 'react'
import { api } from '../services/api.ts'
import ReactMarkdown from 'react-markdown'
import { Send, Bot, Info, ShieldAlert } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export const Chatbot = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI Wealth Advisor. My primary API connection is currently limited, so I am operating in **Offline Mode**.\n\nHowever, I can still analyze your profile and answer questions! Try asking me:\n- *"Can you recommend some assets for my profile?"*\n- *"What is asset allocation?"*\n- *"How does inflation affect my investments?"*\n- *"What\'s the difference between an ETF and a mutual fund?"*\n\n*Reminder: My advice is for educational purposes.*' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            // Note: Making fake mock call if API integration not fully live yet
            const reply = await api.post('/chat', { message: userMsg })
            setMessages(prev => [...prev, { role: 'assistant', content: reply.response }])
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection Error: Unable to reach the AI server right now. Make sure the backend is running and tokens are valid.' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-[var(--color-bg-base)]">
            {/* Main Chat Container */}
            <div className="flex-1 flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-container)] border border-[var(--color-surface-light)] shadow-2xl overflow-hidden relative">

                {/* Chat Header */}
                <div className="h-16 border-b border-[var(--color-surface-light)] px-6 flex items-center justify-between bg-[var(--color-bg-base)]/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-[var(--radius-ui)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center font-bold">
                                <Bot size={20} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[var(--color-semantic-up)] border-2 border-[var(--color-surface)] rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="font-bold text-white tracking-wide">AI Wealth Advisor</h2>
                            <div className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-semantic-up)]"></span> Active
                            </div>
                        </div>
                    </div>
                    <button className="p-2 text-[var(--color-text-muted)] hover:text-white transition-colors" title="Information">
                        <Info size={20} />
                    </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-5 py-4 ${msg.role === 'user'
                                ? 'bg-[var(--color-accent)] text-gray-900 rounded-[16px] rounded-br-[4px] shadow-[0_4px_20px_rgba(0,217,255,0.15)] font-medium'
                                : 'bg-[var(--color-surface-light)] text-gray-100 rounded-[16px] rounded-bl-[4px] shadow-lg border border-[var(--color-surface-light)]'
                                }`}>
                                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-p:text-gray-900 prose-a:text-gray-800 font-medium' : 'prose-invert prose-p:leading-relaxed prose-a:text-[var(--color-accent)]'}`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-[var(--color-surface-light)] text-gray-100 rounded-[16px] rounded-bl-[4px] px-5 py-5 shadow-lg border border-[var(--color-surface-light)] flex gap-2 items-center h-[52px]">
                                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce text-transparent">_</div>
                                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce text-transparent" style={{ animationDelay: '0.2s' }}>_</div>
                                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce text-transparent" style={{ animationDelay: '0.4s' }}>_</div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-surface-light)] relative z-10">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your portfolio, market trends, or terminology..."
                            className="w-full bg-[var(--color-bg-base)] border border-[var(--color-surface-light)] rounded-[var(--radius-button)] pl-5 pr-14 py-4 text-white hover:border-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all duration-200 placeholder:text-gray-600 shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-[var(--radius-button)] flex items-center justify-center text-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Send size={18} className={`transition-transform duration-200 ${(!input.trim() || loading) ? '' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}`} />
                        </button>
                    </form>
                    <div className="text-center mt-3 text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1.5 font-medium">
                        <ShieldAlert size={12} className="text-[var(--color-semantic-warn)]" />
                        AI generated advice. For educational purposes only. Do not use for real trading.
                    </div>
                </div>
            </div>
        </div>
    )
}
