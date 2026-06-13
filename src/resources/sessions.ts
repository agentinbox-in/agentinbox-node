import type { AgentInboxClient } from '../client'
import type { CreateSessionInput, ListResponse, Session, SessionDetailResponse } from '../types'

export class SessionResource {
  constructor(private readonly client: AgentInboxClient) {}

  async create(input: CreateSessionInput): Promise<Session> {
    return this.client.post<Session>('/sessions', input)
  }

  async list(options?: { limit?: number }): Promise<ListResponse<Session>> {
    const params = new URLSearchParams()
    if (options?.limit) params.set('limit', String(options.limit))
    const query = params.toString()
    return this.client.get<ListResponse<Session>>(`/sessions${query ? `?${query}` : ''}`)
  }

  async get(id: string, options?: { include?: string[] }): Promise<SessionDetailResponse> {
    const params = new URLSearchParams()
    if (options?.include?.length) params.set('include', options.include.join(','))
    const query = params.toString()
    return this.client.get<SessionDetailResponse>(`/sessions/${id}${query ? `?${query}` : ''}`)
  }

  async complete(id: string): Promise<Session> {
    return this.client.post<Session>(`/sessions/${id}`)
  }
}
