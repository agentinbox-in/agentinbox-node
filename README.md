# AgentInbox SDK

Official TypeScript/JavaScript SDK for the [AgentInbox](https://agentinbox.in) email verification API.

## Installation

```bash
npm install agentinbox.in
# or
yarn add agentinbox.in
# or
pnpm add agentinbox.in
```

## Quick Start

```typescript
import { AgentInboxClient } from 'agentinbox.in'

const client = new AgentInboxClient({
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
import { QuotaExceededError, RateLimitError } from 'agentinbox.in'

try {
  await client.inboxes.create()
} catch (err) {
  if (err instanceof QuotaExceededError) {
    console.log('Quota exceeded:', err.limit)
  } else if (err instanceof RateLimitError) {
    console.log('Rate limited:', err.message)
  }
}
```

## Resources

- [API Documentation](https://agentinbox.in/docs)
- [Node.js SDK Docs](https://agentinbox.in/docs/sdk-node)
- [MCP Server](https://agentinbox.in/llms.txt)
- [Dashboard](https://agentinbox.in/dashboard)

## License

MIT
