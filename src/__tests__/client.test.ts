import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AgentInboxClient } from '../client'
import { AgentInboxError, NotFoundError, RateLimitError } from '../errors'
import { InboxResource } from '../resources/inboxes'
import { MessageResource, WaitResource, ExtractionResource } from '../resources/waits'
import { SessionResource } from '../resources/sessions'
import { ApiKeyResource } from '../resources/api-keys'
import { WebhookResource } from '../resources/webhooks'

function createJsonResponse(status: number, body: unknown, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

describe('AgentInboxClient', () => {
  beforeEach(() => {
    if (!globalThis.fetch) {
      throw new Error('fetch is not available in this environment')
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('instantiates with defaults and exposes resources', () => {
    const client = new AgentInboxClient({ apiKey: 'at_test_123' })
    expect(client.apiKey).toBe('at_test_123')
    expect(client.baseUrl).toBe('https://agentinbox.in/api/v1')
    expect(client.timeoutMs).toBe(30000)
    expect(client.retries).toBe(3)

    expect(client.inboxes).toBeInstanceOf(InboxResource)
    expect(client.messages).toBeInstanceOf(MessageResource)
    expect(client.waits).toBeInstanceOf(WaitResource)
    expect(client.extractions).toBeInstanceOf(ExtractionResource)
    expect(client.sessions).toBeInstanceOf(SessionResource)
    expect(client.apiKeys).toBeInstanceOf(ApiKeyResource)
    expect(client.webhooks).toBeInstanceOf(WebhookResource)
  })

  it('uses custom options', () => {
    const client = new AgentInboxClient({
      apiKey: 'key',
      baseUrl: 'https://example.com/api/v1',
      timeoutMs: 5000,
      retries: 1,
    })
    expect(client.baseUrl).toBe('https://example.com/api/v1')
    expect(client.timeoutMs).toBe(5000)
    expect(client.retries).toBe(1)
  })

  it('sends Authorization and JSON headers', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createJsonResponse(200, { ok: true }))

    const client = new AgentInboxClient({ apiKey: 'key' })
    await client.get('/test')

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://agentinbox.in/api/v1/test',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: 'Bearer key',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }),
    )
  })

  it('sends Idempotency-Key header for POST when provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createJsonResponse(200, { ok: true }))

    const client = new AgentInboxClient({ apiKey: 'key' })
    await client.post('/test', { foo: 'bar' }, 'idem-key-123')

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Idempotency-Key': 'idem-key-123',
        }),
      }),
    )
  })

  it('does not send Idempotency-Key header when omitted', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createJsonResponse(200, { ok: true }))

    const client = new AgentInboxClient({ apiKey: 'key' })
    await client.post('/test', { foo: 'bar' })

    const [, init] = fetchSpy.mock.calls[0]
    expect((init as RequestInit).headers).not.toHaveProperty('Idempotency-Key')
  })

  it('returns parsed JSON on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(createJsonResponse(200, { id: '123' }))
    const client = new AgentInboxClient({ apiKey: 'key' })
    const result = await client.get('/test')
    expect(result).toEqual({ id: '123' })
  })

  it('maps error responses to AgentInboxError subclasses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      createJsonResponse(404, { error: { code: 'not_found', message: 'Inbox not found.' } }),
    )
    const client = new AgentInboxClient({ apiKey: 'key', retries: 0 })
    await expect(client.get('/inboxes/123')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('handles non-JSON error responses gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Bad Gateway', { status: 502 }))
    const client = new AgentInboxClient({ apiKey: 'key', retries: 0 })
    await expect(client.get('/test')).rejects.toBeInstanceOf(AgentInboxError)
  })

  it('retries 429 errors with Retry-After header', async () => {
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce(
        createJsonResponse(
          429,
          { error: { code: 'rate_limited', message: 'Too many requests' } },
          { 'Retry-After': '0' },
        ),
      )
      .mockResolvedValueOnce(createJsonResponse(200, { ok: true }))
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchSpy)

    const client = new AgentInboxClient({ apiKey: 'key', retries: 2, timeoutMs: 5000 })
    const result = await client.get('/test')

    expect(result).toEqual({ ok: true })
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('retries 5xx errors with exponential backoff', async () => {
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce(createJsonResponse(500, { error: { code: 'internal_error', message: 'Server error' } }))
      .mockResolvedValueOnce(createJsonResponse(200, { ok: true }))
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchSpy)

    const client = new AgentInboxClient({ apiKey: 'key', retries: 2, timeoutMs: 5000 })
    const result = await client.get('/test')
    expect(result).toEqual({ ok: true })
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('does not retry 4xx errors other than 429', async () => {
    const fetchSpy = vi.fn().mockImplementation(() =>
      createJsonResponse(400, { error: { code: 'invalid_request', message: 'Bad request' } }),
    )
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchSpy)

    const client = new AgentInboxClient({ apiKey: 'key', retries: 3 })
    await expect(client.get('/test')).rejects.toBeInstanceOf(AgentInboxError)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('throws timeout error when request exceeds timeoutMs', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal
        if (signal?.aborted) {
          const err = new Error('AbortError')
          err.name = 'AbortError'
          reject(err)
          return
        }
        signal?.addEventListener('abort', () => {
          const err = new Error('AbortError')
          err.name = 'AbortError'
          reject(err)
        })
      })
    })

    const client = new AgentInboxClient({ apiKey: 'key', timeoutMs: 10, retries: 0 })
    await expect(client.get('/test')).rejects.toThrow('Request timed out')
  })

  it('gives up after exhausting retries', async () => {
    const fetchSpy = vi.fn().mockImplementation(() =>
      createJsonResponse(429, { error: { code: 'rate_limited', message: 'Slow down' } }),
    )
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchSpy)

    const client = new AgentInboxClient({ apiKey: 'key', retries: 2, timeoutMs: 5000 })
    await expect(client.get('/test')).rejects.toBeInstanceOf(RateLimitError)
    expect(fetchSpy).toHaveBeenCalledTimes(3)
  })
})
