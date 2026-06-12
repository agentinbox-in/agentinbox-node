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
