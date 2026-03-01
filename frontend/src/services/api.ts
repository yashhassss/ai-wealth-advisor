import { supabase } from '../lib/supabase'

export const api = {
    async request(endpoint: string, options: RequestInit = {}) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
        const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

        // Always attach fresh auth session
        const { data: { session } } = await supabase.auth.getSession()
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {})
        }

        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`
        }

        const response = await fetch(url, { ...options, headers })

        // Handle global strict rate limit or auth issues
        if (!response.ok) {
            let message = 'An error occurred'
            try {
                const errData = await response.json()
                message = errData.detail || errData.message || message
            } catch {
                if (response.status === 429) message = "Too many requests. Please slow down."
                if (response.status === 401) message = "Session expired. Please log in again."
            }
            throw new Error(message)
        }

        return response.json()
    },

    get(endpoint: string) {
        return this.request(endpoint, { method: 'GET' })
    },

    post(endpoint: string, body: unknown) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) })
    },

    patch(endpoint: string, body: unknown) {
        return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) })
    }
}
