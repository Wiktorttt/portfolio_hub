// Common types used throughout the application

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface WebhookStatusResponse {
  code?: number | string;
  status?: string;
  message?: string;
}

export interface ErrorResponse {
  response?: {
    status?: number;
    data?: unknown;
  };
  code?: string;
  message?: string;
}

export interface GameIdeaItem {
  title?: string;
  description?: string;
  genre?: string;
  platform?: string[];
  audience?: string;
  gameplay?: string;
  art_style?: string;
  monetization?: string;
  themes?: string[];
  [key: string]: unknown;
}

export interface GameIdeaGeneratorResponse {
  ideas?: GameIdeaItem[];
  result?: GameIdeaItem[];
  output?: GameIdeaItem[] | { sanitized?: string; text?: string };
  [key: string]: unknown;
}

export interface N8nWebhookData {
  code?: number | string;
  status?: string;
  message?: string;
  [key: string]: unknown;
}
