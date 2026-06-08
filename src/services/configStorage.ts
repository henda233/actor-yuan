import type { BillingPrices } from '../types/storage';

const KEYS = {
  apiKey: 'actor-yuan:api-key',
  model: 'actor-yuan:model',
  billingPrices: 'actor-yuan:billing-prices',
} as const;

export function getApiKey(): string | null {
  return localStorage.getItem(KEYS.apiKey);
}

export function setApiKey(value: string): void {
  localStorage.setItem(KEYS.apiKey, value);
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
