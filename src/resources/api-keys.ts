import type { AgentInboxClient } from '../client'
import type { ApiKey, CreateApiKeyInput, ListResponse } from '../types'

export class ApiKeyResource {
  constructor(private readonly client: AgentInboxClient) {}

  async create(input: CreateApiKeyInput): Promise<ApiKey & { key: string }> {
    return this.client.post<ApiKey & { key: string }>('/api-keys', input)
  }

  async list(): Promise<ListResponse<ApiKey>> {
    return this.client.get<ListResponse<ApiKey>>('/api-keys')
  }

  async delete(id: string): Promise<{ id: string; object: 'api_key'; deleted: boolean }> {
    return this.client.delete<{ id: string; object: 'api_key'; deleted: boolean }>(`/api-keys/${id}`)
  }
}
