import type { Message, ChatResult, ProviderType } from '../types/storage';
import { createOpenAIProvider } from './providers/openaiProvider';
import { createAnthropicProvider } from './providers/anthropicProvider';
import { createMockProvider } from './providers/mockProvider';

export interface AIService {
  chat(messages: Message[], systemPrompt: string): Promise<ChatResult>;
  testConnection(): Promise<void>;
}

export interface AIServiceConfig {
  provider: ProviderType;
  apiKey: string;
  apiBaseUrl?: string;
  model: string;
}

export class AINetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AINetworkError';
  }
}

export class AIAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIAuthError';
  }
}

export class AIRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIRateLimitError';
  }
}

export class AIAPIError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'AIAPIError';
    this.statusCode = statusCode;
  }
}

export async function handleAPIError(response: Response): Promise<never> {
  const status = response.status;
  let message: string;
  try {
    const body = await response.json();
    message = body.error?.message ?? JSON.stringify(body);
  } catch {
    message = `${status} ${response.statusText}`;
  }
  if (status === 401 || status === 403) throw new AIAuthError(message);
  if (status === 429) throw new AIRateLimitError(message);
  throw new AIAPIError(status, message);
}

export function createAIService(config: AIServiceConfig): AIService {
  switch (config.provider) {
    case 'openai':
      return createOpenAIProvider(config.apiKey, config.apiBaseUrl ?? 'https://api.openai.com/v1', config.model);
    case 'anthropic':
      return createAnthropicProvider(config.apiKey, config.model);
    case 'mock':
      return createMockProvider();
  }
}
