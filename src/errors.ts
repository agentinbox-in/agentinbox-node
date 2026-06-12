export class AgentTempError extends Error {
  readonly code: string
  readonly status: number
  readonly docsUrl: string

  constructor(code: string, message: string, status: number, docsUrl: string) {
    super(message)
    this.name = 'AgentTempError'
    this.code = code
    this.status = status
    this.docsUrl = docsUrl
  }
}

export class UnauthorizedError extends AgentTempError {}
export class RateLimitError extends AgentTempError {}
export class QuotaExceededError extends AgentTempError {}
export class NotFoundError extends AgentTempError {}
export class InvalidRequestError extends AgentTempError {}

export function createError(data: { code: string; message: string; docs_url?: string }): AgentTempError {
  const statusMap: Record<string, number> = {
    unauthorized: 401,
    forbidden: 403,
    insufficient_scope: 403,
    not_found: 404,
    invalid_request: 400,
    rate_limited: 429,
    quota_exceeded: 429,
    conflict: 409,
    internal_error: 500,
  }

  const status = statusMap[data.code] ?? 500
  const docsUrl = data.docs_url ?? `https://agenttemp.dev/docs/errors#${data.code}`

  switch (data.code) {
    case 'unauthorized':
      return new UnauthorizedError(data.code, data.message, status, docsUrl)
    case 'rate_limited':
      return new RateLimitError(data.code, data.message, status, docsUrl)
    case 'quota_exceeded':
      return new QuotaExceededError(data.code, data.message, status, docsUrl)
    case 'not_found':
      return new NotFoundError(data.code, data.message, status, docsUrl)
    case 'invalid_request':
      return new InvalidRequestError(data.code, data.message, status, docsUrl)
    default:
      return new AgentTempError(data.code, data.message, status, docsUrl)
  }
}
