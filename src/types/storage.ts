export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface BillingPrice {
  inputPrice: number;
  outputPrice: number;
}

export type BillingPrices = Record<string, BillingPrice>;

export interface ExportData {
  version: 1;
  exportedAt: string;
  module: string;
  messages: Message[];
}

export interface AppData {
  module: string;
  messages: Message[];
}
