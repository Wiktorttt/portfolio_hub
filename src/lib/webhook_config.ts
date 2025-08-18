// Shared headers for all webhooks
const SHARED_HEADERS = {
  'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID || '',
  'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET || ''
};

// Base URL for external webhooks
const BASE_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';

// Webhook configurations
export const WEBHOOK_CONFIGS = {
  status: {
    name: 'status',
    externalUrl: `${BASE_WEBHOOK_URL}/status`,
    headers: SHARED_HEADERS,
    validation: {
      requiredFields: [],
      fieldTypes: {}
    }
  },
  summarizer: {
    name: 'summarizer',
    externalUrl: `${BASE_WEBHOOK_URL}/summarizer`,
    headers: SHARED_HEADERS,
    validation: {
      requiredFields: ['text'],
      fieldTypes: {
        text: 'string',
        attachments: 'array'
      }
    }
  },
  generate_idea: {
    name: 'generate_idea',
    externalUrl: `${BASE_WEBHOOK_URL}/generate_idea`,
    headers: SHARED_HEADERS,
    validation: {
      requiredFields: ['context', 'my_thoughts'],
      fieldTypes: {
        context: 'string',
        my_thoughts: 'string',
        quantity: 'number'
      }
    }
  },
  analyzer: {
    name: 'analyzer',
    externalUrl: `${BASE_WEBHOOK_URL}/analyzer`,
    headers: SHARED_HEADERS,
    validation: {
      requiredFields: ['region', 'industry', 'analysis_depth', 'keywords'],
      fieldTypes: {
        region: 'string',
        industry: 'string',
        analysis_depth: 'number',
        keywords: 'string'
      }
    }
  },
  game_idea_generator: {
    name: 'game_idea_generator',
    externalUrl: `${BASE_WEBHOOK_URL}/game_idea_generator`,
    headers: SHARED_HEADERS,
    validation: {
      requiredFields: ['genre', 'platform', 'art_style', 'monetization'],
      fieldTypes: {
        genre: 'string',
        custom_genre: 'string',
        platform: 'array',
        audience_age: 'string',
        audience_skill: 'string',
        playstyle: 'string',
        art_style: 'string',
        monetization: 'string',
        themes: 'string',
        
      }
    }
  },
  'chat-gpt-2': {
    name: 'chat-gpt-2',
    externalUrl: `${BASE_WEBHOOK_URL}/chat-gpt-2`,
    headers: SHARED_HEADERS,
    validation: {
      requiredFields: ['model', 'message', 'uuid'],
      fieldTypes: {
        model: 'string',
        message: 'string',
        uuid: 'string'
      }
    }
  },
  'chat-gpt-2-memory': {
    name: 'chat-gpt-2-memory',
    externalUrl: `${BASE_WEBHOOK_URL}/chat-gpt-2-memory`,
    headers: SHARED_HEADERS,
    validation: {
      requiredFields: ['uuid'],
      fieldTypes: {
        uuid: 'string'
      }
    }
  }
  // Add more webhooks here as needed
};



// Type definitions
export interface WebhookConfig {
  name: string;
  externalUrl: string;
  headers: Record<string, string>;
  validation: {
    requiredFields: string[];
    fieldTypes: Record<string, string>;
  };
}

export interface WebhookRequest {
  [key: string]: unknown;
}

export interface WebhookResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Specific response types for better type safety
export interface StatusResponse {
  code: number;
  status: string;
}

export interface FileAttachment {
  filename: string;
  type: string;
  size: number;
  data: string; // base64 encoded file data
}

export interface SummarizerResponse {
  summary?: string;
  result?: string;
  output?: {
    sanitized?: string;
    text?: string;
  };
}

export interface IdeaGeneratorResponse {
  ideas?: IdeaItem[];
  result?: IdeaItem[];
  output?: IdeaItem[] | { sanitized?: string; text?: string };
}

export interface IdeaItem {
  title: string;
  description: string;
  price_point: string;
  time_to_make: number;
}

export interface MarketAnalysis {
  id: string;
  name: string;
  score: number;
  gapDescription: string;
  marketSize: string;
  competitors: string;
  businessModel: string;
  targetCustomers: string;
  risks: string;
  opportunities: string;
  links?: string[];
}

export interface MarketAnalyzerResponse {
  analyses?: MarketAnalysis[];
  result?: MarketAnalysis[];
  output?: MarketAnalysis[] | { sanitized?: string; text?: string };
} 

// Game Idea Generator types
export interface GameIdeaItem {
  title: string;
  core_loop: string;
  primary_mechanics: string[] | string;
  secondary_mechanics?: string[] | string;
  story_premise?: string;
  level_examples?: string[] | string;
  progression_rewards: string;
  monetization_strategy: string;
}

export interface GameIdeaGeneratorResponse {
  ideas?: GameIdeaItem[];
  result?: GameIdeaItem[];
  output?: GameIdeaItem[] | { sanitized?: string; text?: string };
}

// Chat GPT 2.0 types
export interface ChatGpt2Request {
  model: string;
  message: string;
  uuid: string;
}

export interface ChatGpt2ResponseItem {
  output: string;
  total_tokens: number;
}

export interface ChatGpt2Response {
  output: ChatGpt2ResponseItem[];
}

export type ChatGpt2MemoryResponse = ChatGpt2MemoryMessage[];

export interface ChatGpt2MemoryMessage {
  human: string;
  ai: string;
}