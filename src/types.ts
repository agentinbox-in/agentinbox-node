export interface Inbox {
  id: string
  object: 'inbox'
  emailAddress: string
  status: string
  purpose: string | null
  ttlSeconds: number
  expiresAt: string
  completedAt: string | null
  createdAt: string
}

export interface MessageSummary {
  id: string
  object: 'message'
  inboxId: string
  fromEmail: string | null
  fromName: string | null
  toEmail: string | null
  subject: string | null
  hasAttachments: boolean
  sizeBytes: number | null
  receivedAt: string
}

export interface Message extends MessageSummary {
  textBody: string | null
  htmlBody: string | null
}

export interface Extraction {
  id: string
  object: 'extraction'
  inboxId: string
  messageId: string
  type: string
  value: string | null
  url: string | null
  confidence: number | null
  candidates: unknown[] | null
  source: string | null
  createdAt: string
}

export interface Wait {
  id: string
  object: 'wait'
  inboxId: string
  messageId: string | null
  type: string
  status: string
  timeoutSeconds: number
  filters: Record<string, unknown> | null
  result: Record<string, unknown> | null
  completedAt: string | null
  expiresAt: string
  createdAt: string
}

export interface Webhook {
  id: string
  object: 'webhook'
  name: string
  endpointUrl: string
  events: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiKey {
  id: string
  object: 'api_key'
  name: string
  keyPrefix: string
  environment: string
  scopes: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
}

export interface Session {
  id: string
  object: 'session'
  name: string
  status: string
  metadata: Record<string, unknown> | null
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface SessionDetailResponse {
  session: Session
  inboxes?: Inbox[]
  waits?: Wait[]
  messages?: Message[]
  extractions?: Extraction[]
  timeline?: unknown[]
}

export interface WebhookDelivery {
  id: string
  object: 'webhook_delivery'
  webhookId: string
  eventType: string
  status: string
  attempts: number
  responseStatus: number | null
  lastError: string | null
  nextRetryAt: string | null
  deliveredAt: string | null
  createdAt: string
}

export type WebhookEventType =
  | 'email.received'
  | 'otp.extracted'
  | 'magic_link.extracted'
  | 'password_reset.extracted'
  | 'wait.completed'
  | 'inbox.expired'

export interface ListResponse<T> {
  object: 'list'
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface CreateInboxInput {
  ttlSeconds?: number
  purpose?: string
}

export interface CreateWaitInput {
  inboxId: string
  type: 'email' | 'otp' | 'magic_link' | 'password_reset'
  timeoutSeconds?: number
  filters?: {
    from?: string
    subjectContains?: string
    since?: string
  }
}

export interface WorkflowCreateInboxAndWaitInput {
  ttlSeconds?: number
  purpose?: string
  waitType: 'email' | 'otp' | 'magic_link' | 'password_reset'
  timeoutSeconds?: number
  filters?: {
    from?: string
    subjectContains?: string
    since?: string
  }
}

export interface WorkflowCreateInboxAndWaitOutput {
  inbox: Inbox
  wait: Wait
}

export interface WorkflowSignupInput {
  serviceName?: string
  waitType?: 'otp' | 'magic_link' | 'password_reset'
  timeoutSeconds?: number
}

export interface WorkflowSignupOutput {
  inbox: Inbox
  wait: Wait
  instructions: {
    emailAddress: string
    useThisEmail: string
  }
}

export interface CreateSessionInput {
  name: string
  ttlSeconds?: number
  metadata?: Record<string, unknown>
}

export interface CreateApiKeyInput {
  name?: string
  environment: 'live'
  scope?: string
}

export interface CreateWebhookInput {
  name: string
  endpointUrl: string
  events: WebhookEventType[]
}

export interface UpdateWebhookInput {
  name?: string
  endpointUrl?: string
  events?: WebhookEventType[]
  active?: boolean
}

export type UsageMetric =
  | 'inboxes_created'
  | 'emails_received'
  | 'api_requests'
  | 'waits'

export interface UsageMetricItem {
  metric: UsageMetric
  count: number
  limit: number
  remaining: number
}

export interface UsageResponse {
  object: 'usage'
  plan: string
  retentionDays: number
  webhooks: boolean
  mcp: boolean
  customDomains: number
  metrics: UsageMetricItem[]
  resetAt: string
}
