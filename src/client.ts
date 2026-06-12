import { createError } from './errors'

export interface AgentTempClientOptions {
  /** API key (e.g., at_live_... or at_test_...) */
  apiKey: string
  /** Base URL (default: https://tempmailai.vercel.app/api/v1) */
  baseUrl?: string
  /** Request timeout in ms (default: 30000) */
  timeoutMs?: number
  /** Number of retries for failed requests (default: 3) */
  retries?: number
}

export class AgentTempClient {
  readonly apiKey: string
  readonly baseUrl: string
  readonly timeoutMs: number
  readonly retries: number

  constructor(options: AgentTempClientOptions) {
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl ?? 'https://tempmailai.vercel.app/api/v1'
    this.timeoutMs = options.timeoutMs ?? 30000
    this.retries = options.retries ?? 3
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      throw createError(data.error ?? { code: 'unknown', message: 'Unknown error' })
    }

    return data as T
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body)
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path)
  }
}
