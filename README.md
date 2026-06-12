# AgentTemp SDK

TypeScript SDK for the AgentTemp email verification API.

## Installation

```bash
npm install agenttemp
# or
yarn add agenttemp
# or
pnpm add agenttemp
```

## Quick Start

```typescript
import { AgentTempClient } from 'agenttemp'

const client = new AgentTempClient({
  apiKey: 'at_live_...',
})

// Create an inbox
const inbox = await client.inboxes.create({
  ttlSeconds: 3600,
  purpose: 'Signup test',
})

console.log(inbox.emailAddress)

// Wait for OTP
const wait = await client.waits.create({
  inboxId: inbox.id,
  type: 'otp',
  timeoutSeconds: 120,
})

console.log(wait.result?.value)
```

## Features

- Full TypeScript support with strict types
- Automatic retry with exponential backoff
- Rate limit handling
- Custom error classes for each error type
- ESM and CommonJS support

## Error Handling

```typescript
import { QuotaExceededError, RateLimitError } from 'agenttemp'

try {
  await client.inboxes.create()
} catch (err) {
  if (err instanceof QuotaExceededError) {
    console.log('Quota exceeded:', err.limit)
  } else if (err instanceof RateLimitError) {
    console.log('Rate limited, retry after:', err.retryAfter)
  }
}
```

## Resources

- [API Documentation](https://tempmailai.vercel.app/api/v1/openapi.json)
- [MCP Server](https://github.com/kunalgawade19042002-gif/agenttemp-mcp)

## License

MIT
