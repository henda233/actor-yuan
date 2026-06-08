import type { BillingPrices, ProviderType } from '../types/storage';

export const DEFAULT_SYSTEM_PROMPT = `你是一位资深的TRPG游戏主持人。

当前阶段：{stage}

你的职责是根据上下文、玩家行为和相关游戏数据进行情节推演。
- 处于"推演方案制定"阶段时：分析当前局势，制定推演思路和可能的发展方向，不需要输出完整情节。
- 处于"游戏情节推演"阶段时：基于推演方案，输出生动、沉浸式的游戏情节叙述。`;

export function buildSystemPrompt(stage: string, reasoning?: string): string {
  const prompt = getSystemPrompt() || DEFAULT_SYSTEM_PROMPT;
  let result = prompt.replace(/\{stage\}/g, stage);
  if (reasoning) {
    result += `\n\n## 推演方案\n${reasoning}`;
  }
  return result;
}

const KEYS = {
  provider: 'actor-yuan:provider',
  apiKey: 'actor-yuan:api-key',
  apiBaseUrl: 'actor-yuan:api-base-url',
  model: 'actor-yuan:model',
  billingPrices: 'actor-yuan:billing-prices',
  systemPrompt: 'actor-yuan:system-prompt',
  debugMode: 'actor-yuan:debug-mode',
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

export function getDebugMode(): boolean {
  return localStorage.getItem(KEYS.debugMode) === 'true';
}

export function setDebugMode(value: boolean): void {
  localStorage.setItem(KEYS.debugMode, String(value));
}
