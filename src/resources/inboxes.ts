import type { AgentInboxClient } from '../client'
import type { CreateInboxInput, Inbox, ListResponse } from '../types'

export class InboxResource {
  constructor(private readonly client: AgentInboxClient) {}

  async create(input: CreateInboxInput): Promise<Inbox> {
    return this.client.post<Inbox>('/inboxes', input)
  }

  async list(options?: { cursor?: string; limit?: number; status?: string }): Promise<ListResponse<Inbox>> {
    const params = new URLSearchParams()
    if (options?.cursor) params.set('cursor', options.cursor)
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.status) params.set('status', options.status)
    const query = params.toString()
    return this.client.get<ListResponse<Inbox>>(`/inboxes${query ? `?${query}` : ''}`)
  }

  async get(id: string): Promise<Inbox> {
    return this.client.get<Inbox>(`/inboxes/${id}`)
  }

  async delete(id: string): Promise<{ id: string; deleted: boolean }> {
    return this.client.delete<{ id: string; deleted: boolean }>(`/inboxes/${id}`)
  }
}
