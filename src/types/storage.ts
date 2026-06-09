export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'draft' | 'confirmed';
  reasoning?: string;
}

export interface BillingPrice {
  inputPrice: number;
  outputPrice: number;
}

export type BillingPrices = Record<string, BillingPrice>;

export interface ExportData {
  version: 2;
  exportedAt: string;
  module: string;
  messages: Message[];
  contextHistory: string;
}

export interface AppData {
  module: string;
  messages: Message[];
  contextHistory: string;
}

export type ProviderType = 'openai' | 'anthropic' | 'mock';

export interface ChatResult {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}
