# Scalable Webhook System

This document explains the new scalable webhook system implemented in the Portfolio Hub.

## Overview

The webhook system has been redesigned to be scalable and support multiple webhooks with shared configuration while maintaining backward compatibility.

## Architecture

### 1. Centralized Configuration (`/src/lib/webhook_config.ts`)

All webhook configurations are centralized in one file:

```typescript
export const WEBHOOK_CONFIGS = {
  summarizer: {
    name: 'summarizer',
    externalUrl: `${BASE_WEBHOOK_URL}/summarizer`,
    headers: SHARED_HEADERS,
    validation: {
      requiredFields: ['text'],
      fieldTypes: { text: 'string' }
    }
  },
  translator: {
    name: 'translator',
    externalUrl: `${BASE_WEBHOOK_URL}/translator`,
    headers: SHARED_HEADERS,
    validation: {
      requiredFields: ['text', 'targetLanguage'],
      fieldTypes: {
        text: 'string',
        targetLanguage: 'string'
      }
    }
  }
  // Add more webhooks here
};
```

### 2. Generic API Route (`/src/app/api/webhook/[webhookName]/route.ts`)

A single dynamic API route handles all webhook requests:

- **URL Pattern**: `/api/webhook/{webhookName}`
- **Method**: POST
- **Features**: 
  - Automatic validation
  - Error handling
  - Logging

### 3. Utility Functions (`/src/lib/webhook_utils.ts`)

Reusable functions for webhook operations:

- `validateWebhookRequest()` - Validates request data
- `executeWebhook()` - Executes webhook calls
- `getAvailableWebhooks()` - Lists available webhooks
- `getWebhookConfig()` - Gets webhook configuration

### 4. Enhanced WebhookButton Component

The WebhookButton component now supports both legacy and new systems:

```typescript
// New system (recommended)
<WebhookButton
  webhookName="summarizer"
  payload={{ text: content }}
  onSuccess={handleSuccess}
/>

// Legacy system (backward compatible)
<WebhookButton
  webhookConfig={WEBHOOKS.summarizer}
  payload={{ text: content }}
  onSuccess={handleSuccess}
/>
```

## Adding a New Webhook

### Step 1: Add Configuration

Add your webhook configuration to `/src/lib/webhook_config.ts`:

```typescript
export const WEBHOOK_CONFIGS = {
  // ... existing webhooks
  myNewWebhook: {
    name: 'myNewWebhook',
    externalUrl: `${BASE_WEBHOOK_URL}/myNewWebhook`,
    headers: SHARED_HEADERS,
    validation: {
      requiredFields: ['text', 'option'],
      fieldTypes: {
        text: 'string',
        option: 'string'
      }
    }
  }
};
```

### Step 2: Create the Page

Create a new page at `/src/app/myNewWebhook/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import WebhookButton from '@/components/WebhookButton';

export default function MyNewWebhookPage() {
  const [content, setContent] = useState('');
  const [option, setOption] = useState('');
  const [result, setResult] = useState('');

  const handleSuccess = (data: unknown) => {
    // Handle the response data
    setResult(JSON.stringify(data));
  };

  return (
    <div>
      {/* Your UI components */}
      <WebhookButton
        webhookName="myNewWebhook"
        payload={{ text: content, option }}
        onSuccess={handleSuccess}
      >
        Process
      </WebhookButton>
    </div>
  );
}
```

### Step 3: Add to Hub

Add the new webhook to the main hub in `/src/app/page.tsx`:

```typescript
const panels = [
  // ... existing panels
  { 
    id: 'myNewWebhook', 
    name: 'My New Webhook', 
    description: 'Description of what it does',
    icon: <MyIcon size={24} />
  }
];
```

## Benefits

1. **Scalability**: Easy to add new webhooks without code duplication
2. **Consistency**: All webhooks use the same headers and error handling
3. **Validation**: Automatic request validation based on configuration
4. **Maintainability**: Centralized configuration and logic
5. **Backward Compatibility**: Existing code continues to work
6. **Type Safety**: TypeScript interfaces for better development experience

## Migration from Legacy System

Existing webhooks using the legacy system will continue to work. To migrate to the new system:

1. Replace `webhookConfig={WEBHOOKS.summarizer}` with `webhookName="summarizer"`
2. Update the API endpoint from `/api/summarize` to `/api/webhook/summarizer`
3. The payload and response handling remain the same

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors**: Missing required fields, wrong data types
- **Network Errors**: Connection issues, timeouts
- **External Service Errors**: Non-200 responses from external webhooks
- **Internal Errors**: Server-side processing errors

All errors are logged and returned with appropriate HTTP status codes. 