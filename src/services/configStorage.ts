import type { BillingPrices, ProviderType } from '../types/storage';

const KEYS = {
  provider: 'actor-yuan:provider',
  apiKey: 'actor-yuan:api-key',
  apiBaseUrl: 'actor-yuan:api-base-url',
  model: 'actor-yuan:model',
  billingPrices: 'actor-yuan:billing-prices',
  systemPrompt: 'actor-yuan:system-prompt',
} as const;

export function getProvider(): ProviderType {
  const value = localStorage.getItem(KEYS.provider);
  if (value === 'openai' || value === 'anthropic' || value === 'mock') return value;
  return 'mock';
}

export function setProvider(value: ProviderType): void {
  localStorage.setItem(KEYS.provider, value);
}

export function getApiKey(): string | null {
  return localStorage.getItem(KEYS.apiKey);
}

export function setApiKey(value: string): void {
  localStorage.setItem(KEYS.apiKey, value);
}

export function getApiBaseUrl(): string {
  return localStorage.getItem(KEYS.apiBaseUrl) || 'https://api.openai.com/v1';
}

export function setApiBaseUrl(value: string): void {
  localStorage.setItem(KEYS.apiBaseUrl, value);
}

export function getModel(): string | null {
  return localStorage.getItem(KEYS.model);
}

export function setModel(value: string): void {
  localStorage.setItem(KEYS.model, value);
}

export function getBillingPrices(): BillingPrices {
  const raw = localStorage.getItem(KEYS.billingPrices);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as BillingPrices;
  } catch {
    return {};
  }
}

export function setBillingPrices(value: BillingPrices): void {
  localStorage.setItem(KEYS.billingPrices, JSON.stringify(value));
}

export function getSystemPrompt(): string {
  return localStorage.getItem(KEYS.systemPrompt) ?? '';
}

export function setSystemPrompt(value: string): void {
  localStorage.setItem(KEYS.systemPrompt, value);
}
