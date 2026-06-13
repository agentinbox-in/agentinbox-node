import { AgentInboxError, createError } from './errors'
import { ApiKeyResource } from './resources/api-keys'
import { ExtractionResource, MessageResource, WaitResource } from './resources/waits'
import { InboxResource } from './resources/inboxes'
import { SessionResource } from './resources/sessions'
import { UsageResource } from './resources/usage'
import { WebhookResource } from './resources/webhooks'

export interface AgentInboxClientOptions {
  /** API key (e.g., at_live_... or at_test_...) */
  apiKey: string
  /** Base URL (default: https://agentinbox.in/api/v1) */
  baseUrl?: string
  /** Request timeout in ms (default: 30000) */
  timeoutMs?: number
  /** Number of retries for failed requests (default: 3) */
  retries?: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class AgentInboxClient {
  readonly apiKey: string
  readonly baseUrl: string
  readonly timeoutMs: number
  readonly retries: number

  readonly inboxes: InboxResource
  readonly messages: MessageResource
  readonly waits: WaitResource
  readonly extractions: ExtractionResource
  readonly sessions: SessionResource
  readonly apiKeys: ApiKeyResource
  readonly webhooks: WebhookResource
  readonly usage: UsageResource

  constructor(options: AgentInboxClientOptions) {
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl ?? 'https://agentinbox.in/api/v1'
    this.timeoutMs = options.timeoutMs ?? 30000
    this.retries = options.retries ?? 3

    this.inboxes = new InboxResource(this)
    this.messages = new MessageResource(this)
    this.waits = new WaitResource(this)
    this.extractions = new ExtractionResource(this)
    this.sessions = new SessionResource(this)
    this.apiKeys = new ApiKeyResource(this)
    this.webhooks = new WebhookResource(this)
    this.usage = new UsageResource(this)
  }

  private isRetryableStatus(status: number): boolean {
    return status === 429 || status >= 500
  }

  private getRetryDelay(attempt: number, response: Response | null): number {
    if (response) {
      const retryAfter = response.headers.get('retry-after')
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10)
        if (!Number.isNaN(seconds)) return seconds * 1000
      }
    }
    return Math.min(1000 * 2 ** attempt, 30000)
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      return response.json()
    }
    const text = await response.text()
    return text || null
  }

  private extractErrorPayload(
    response: Response,
    data: unknown,
  ): { code: string; message: string; docs_url?: string } {
    if (data && typeof data === 'object' && 'error' in data) {
      const error = data.error
      if (error && typeof error === 'object') {
        const code = 'code' in error && typeof error.code === 'string' ? error.code : 'unknown'
        const message = 'message' in error && typeof error.message === 'string'
          ? error.message
          : response.statusText || 'Unknown error'
        const docsUrl = 'docs_url' in error && typeof error.docs_url === 'string'
          ? error.docs_url
          : undefined
        return { code, message, docs_url: docsUrl }
      }
    }
    if (typeof data === 'string' && data) {
      return { code: 'unknown', message: data }
    }
    return { code: 'unknown', message: response.statusText || 'Unknown error' }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    idempotencyKey?: string,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    }

    let lastError: Error | undefined

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        })
        clearTimeout(timeout)

        const data = await this.parseResponseBody(response)

        if (!response.ok) {
          const errorPayload = this.extractErrorPayload(response, data)
          const error = createError(errorPayload)
          if (!this.isRetryableStatus(response.status) || attempt === this.retries) {
            throw error
          }
          lastError = error
          await sleep(this.getRetryDelay(attempt, response))
          continue
        }

        return data as T
      } catch (err) {
        clearTimeout(timeout)
        if (err instanceof AgentInboxError && err.status >= 400 && err.status < 500 && err.status !== 429) {
          throw err
        }
        if (err instanceof Error && err.name === 'AbortError') {
          lastError = new AgentInboxError(
            'request_timeout',
            'Request timed out',
            0,
            'https://agentinbox.in/docs/errors#request_timeout',
          )
        } else if (err instanceof Error) {
          lastError = err
        } else {
          lastError = new Error(String(err))
        }
        if (attempt === this.retries) {
          throw lastError
        }
        await sleep(this.getRetryDelay(attempt, null))
      }
    }

    throw lastError ?? new Error('Request failed')
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  post<T>(path: string, body?: unknown, idempotencyKey?: string): Promise<T> {
    return this.request<T>('POST', path, body, idempotencyKey)
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path)
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body)
  }
}
