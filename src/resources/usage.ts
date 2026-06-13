import type { AgentInboxClient } from '../client'
import type { UsageResponse } from '../types'

export class UsageResource {
  constructor(private readonly client: AgentInboxClient) {}

  async get(): Promise<UsageResponse> {
    return this.client.get<UsageResponse>('/usage')
  }
}
