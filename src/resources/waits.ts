import type { AgentInboxClient } from '../client'
import type {
  CreateWaitInput,
  Extraction,
  ListResponse,
  Message,
  MessageSummary,
  Wait,
  WorkflowCreateInboxAndWaitInput,
  WorkflowCreateInboxAndWaitOutput,
  WorkflowSignupInput,
  WorkflowSignupOutput,
} from '../types'

export class WaitResource {
  constructor(private readonly client: AgentInboxClient) {}

  async create(input: CreateWaitInput): Promise<Wait> {
    return this.client.post<Wait>('/waits', input)
  }

  async get(id: string): Promise<Wait> {
    return this.client.get<Wait>(`/waits/${id}`)
  }

  async cancel(id: string): Promise<Wait> {
    return this.client.post<Wait>(`/waits/${id}/cancel`)
  }

  async waitForOtp(inboxId: string, timeoutSeconds?: number, filters?: { from?: string; subjectContains?: string }): Promise<Wait> {
    return this.create({ inboxId, type: 'otp', timeoutSeconds, filters })
  }

  async waitForMagicLink(inboxId: string, timeoutSeconds?: number, filters?: { from?: string; subjectContains?: string }): Promise<Wait> {
    return this.create({ inboxId, type: 'magic_link', timeoutSeconds, filters })
  }

  async waitForPasswordReset(inboxId: string, timeoutSeconds?: number, filters?: { from?: string; subjectContains?: string }): Promise<Wait> {
    return this.create({ inboxId, type: 'password_reset', timeoutSeconds, filters })
  }

  async createInboxAndWait(input: WorkflowCreateInboxAndWaitInput): Promise<WorkflowCreateInboxAndWaitOutput> {
    return this.client.post<WorkflowCreateInboxAndWaitOutput>('/workflow/create-inbox-and-wait', input)
  }

  async signup(input?: WorkflowSignupInput): Promise<WorkflowSignupOutput> {
    return this.client.post<WorkflowSignupOutput>('/workflow/signup', input ?? {})
  }
}

export class MessageResource {
  constructor(private readonly client: AgentInboxClient) {}

  async list(inboxId: string, limit?: number): Promise<ListResponse<MessageSummary>> {
    const params = new URLSearchParams()
    if (limit) params.set('limit', String(limit))
    return this.client.get<ListResponse<MessageSummary>>(`/inboxes/${inboxId}/messages?${params.toString()}`)
  }

  async get(id: string): Promise<Message> {
    return this.client.get<Message>(`/messages/${id}`)
  }

  async extract(id: string, useLlm?: boolean): Promise<ListResponse<Extraction>> {
    const query = useLlm === undefined ? '' : `?useLlm=${useLlm}`
    return this.client.post<ListResponse<Extraction>>(`/messages/${id}/extract${query}`)
  }
}

export class ExtractionResource {
  constructor(private readonly client: AgentInboxClient) {}

  async list(inboxId: string, messageId?: string): Promise<ListResponse<Extraction>> {
    const params = new URLSearchParams()
    if (messageId) params.set('messageId', messageId)
    const query = params.toString()
    return this.client.get<ListResponse<Extraction>>(`/inboxes/${inboxId}/extractions${query ? `?${query}` : ''}`)
  }
}
