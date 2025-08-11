import { NextRequest, NextResponse } from 'next/server';
import { executeWebhook, getWebhookConfig } from '@/lib/webhook_utils';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ webhookName: string }> }
) {
  try {
    const { webhookName } = await context.params;
    
    // Check if webhook exists
    const config = getWebhookConfig(webhookName);
    if (!config) {
      return NextResponse.json(
        { error: `Unknown webhook: ${webhookName}` },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Execute webhook
    const result = await executeWebhook(webhookName, body);
    

    
    if (!result.success) {
      console.error(`Webhook ${webhookName} failed:`, result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);

  } catch (error) {
    const { webhookName } = await context.params;
    console.error(`API route error for webhook ${webhookName}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to list available webhooks
export async function GET() {
  try {
    const { WEBHOOK_CONFIGS } = await import('@/lib/webhook_config');
    const availableWebhooks = Object.keys(WEBHOOK_CONFIGS);
    
    return NextResponse.json({
      availableWebhooks: availableWebhooks,
      message: 'Use POST /api/webhook/[webhookName] to execute a webhook'
    });
  } catch (error) {
    console.error('Failed to get webhook information:', error);
    return NextResponse.json(
      { error: 'Failed to get webhook information' },
      { status: 500 }
    );
  }
} 