import { WEBHOOK_CONFIGS, WebhookConfig, WebhookRequest, WebhookResponse } from './webhook_config';

/**
 * Validates webhook request data against the webhook configuration
 */
export function validateWebhookRequest(
  webhookName: string, 
  data: WebhookRequest
): { isValid: boolean; errors: string[] } {
  const config = WEBHOOK_CONFIGS[webhookName as keyof typeof WEBHOOK_CONFIGS];
  
  if (!config) {
    return { isValid: false, errors: [`Unknown webhook: ${webhookName}`] };
  }

  const errors: string[] = [];

  // Check required fields
  for (const field of config.validation.requiredFields) {
    if (field === 'text') {
      // For summarizer, either text or attachments should be present
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        const hasAttachments = data.attachments && Array.isArray(data.attachments) && data.attachments.length > 0;
        if (!hasAttachments) {
          errors.push(`Either text or attachments are required`);
        }
      }
    } else if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check field types
  for (const [field, expectedType] of Object.entries(config.validation.fieldTypes)) {
    if (data[field] !== undefined) {
      let actualType: string;
      if (expectedType === 'array') {
        actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
      } else {
        actualType = typeof data[field];
      }
      
      if (actualType !== expectedType) {
        errors.push(`Field ${field} should be ${expectedType}, got ${actualType}`);
      }
    }
  }

  // Basic sanitization for string fields
  for (const [field, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.length > 10000) {
      errors.push(`Field ${field} is too long (max 10000 characters)`);
    }
  }

  // Validate attachments if present
  if (data.attachments && Array.isArray(data.attachments)) {
    if (data.attachments.length > 3) {
      errors.push('Maximum 3 attachments allowed');
    }
    
    let totalSize = 0;
    for (const attachment of data.attachments) {
      if (!attachment.filename || !attachment.type || !attachment.data) {
        errors.push('Invalid attachment format');
        break;
      }
      
      if (attachment.size > 8 * 1024 * 1024) { // 8MB
        errors.push(`File ${attachment.filename} exceeds 8MB limit`);
      }
      
      totalSize += attachment.size;
    }
    
    if (totalSize > 24 * 1024 * 1024) { // 24MB
      errors.push('Total attachment size exceeds 24MB limit');
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Executes a webhook call to the external service
 */
export async function executeWebhook(
  webhookName: string, 
  data: WebhookRequest
): Promise<WebhookResponse> {
  try {
    const config = WEBHOOK_CONFIGS[webhookName as keyof typeof WEBHOOK_CONFIGS];
    
    if (!config) {
      return {
        success: false,
        error: `Unknown webhook: ${webhookName}`
      };
    }

    // Validate the request
    const validation = validateWebhookRequest(webhookName, data);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Make the request to the external webhook with timeout
    const controller = new AbortController();
    const { API_TIMEOUT_MS } = await import('./config');
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    
    const response = await fetch(config.externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      return {
        success: false,
        error: `Webhook request failed: ${response.status} - ${errorText}`
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      data: responseData
    };

  } catch (error) {
    
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout - server not responding'
        };
      }
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        return {
          success: false,
          error: 'Connection refused - server may be down'
        };
      }
    }
    
    return {
      success: false,
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Gets available webhook names
 */
export function getAvailableWebhooks(): string[] {
  return Object.keys(WEBHOOK_CONFIGS);
}

/**
 * Gets webhook configuration by name
 */
export function getWebhookConfig(webhookName: string): WebhookConfig | null {
  return WEBHOOK_CONFIGS[webhookName as keyof typeof WEBHOOK_CONFIGS] || null;
} 