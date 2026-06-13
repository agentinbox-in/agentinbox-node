import type { AgentInboxClient } from '../client'
import type { CreateWebhookInput, ListResponse, UpdateWebhookInput, Webhook, WebhookDelivery } from '../types'

export class WebhookResource {
  constructor(private readonly client: AgentInboxClient) {}

  async create(input: CreateWebhookInput): Promise<Webhook & { secret: string }> {
    return this.client.post<Webhook & { secret: string }>('/webhooks', input)
  }

  async list(): Promise<ListResponse<Webhook>> {
    return this.client.get<ListResponse<Webhook>>('/webhooks')
  }

  async get(id: string): Promise<Webhook> {
    return this.client.get<Webhook>(`/webhooks/${id}`)
  }

  async update(id: string, input: UpdateWebhookInput): Promise<Webhook> {
    return this.client.patch<Webhook>(`/webhooks/${id}`, input)
  }

  async delete(id: string): Promise<{ id: string; object: 'webhook'; deleted: boolean }> {
    return this.client.delete<{ id: string; object: 'webhook'; deleted: boolean }>(`/webhooks/${id}`)
  }

  async test(id: string): Promise<WebhookDelivery> {
    return this.client.post<WebhookDelivery>(`/webhooks/${id}/test`)
  }

  async rotateSecret(id: string): Promise<Webhook & { secret: string }> {
    return this.client.post<Webhook & { secret: string }>(`/webhooks/${id}/rotate-secret`)
  }
}
