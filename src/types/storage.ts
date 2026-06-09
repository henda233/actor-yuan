export interface MessageBilling {
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface SessionBilling {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
}

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'draft' | 'confirmed';
  reasoning?: string;
  billing?: MessageBilling;
}

export interface BillingPrice {
  inputPrice: number;
  outputPrice: number;
}

export type BillingPrices = Record<string, BillingPrice>;

export interface ExportData {
  version: 3;
  exportedAt: string;
  module: string;
  messages: Message[];
  contextHistory: string;
  billing: SessionBilling;
}

export interface AppData {
  module: string;
  messages: Message[];
  contextHistory: string;
  billing: SessionBilling;
}

export type ProviderType = 'openai' | 'anthropic' | 'mock';

export interface ChatResult {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}
