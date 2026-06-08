import type { Message, ChatResult } from '../../types/storage';
import { AINetworkError, handleAPIError } from '../aiService';
import type { AIService } from '../aiService';

function normalizeMessages(
  messages: Message[],
): { role: 'user' | 'assistant'; content: string }[] {
  const filtered = messages.filter((m) => m.role !== 'system');
  const result: { role: 'user' | 'assistant'; content: string }[] = [];

  for (const msg of filtered) {
    const role = msg.role as 'user' | 'assistant';
    const last = result[result.length - 1];
    if (last && last.role === role) {
      last.content += '\n\n' + msg.content;
    } else {
      result.push({ role, content: msg.content });
    }
  }

  if (result.length > 0 && result[0].role === 'assistant') {
    result.unshift({ role: 'user', content: '' });
  }

  return result;
}

export function createAnthropicProvider(apiKey: string, model: string): AIService {
  const callAPI = async (body: unknown): Promise<Response> => {
    let response: Response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new AINetworkError(e instanceof Error ? e.message : '网络请求失败');
    }
    if (!response.ok) await handleAPIError(response);
    return response;
  };

  return {
    async chat(messages: Message[], systemPrompt: string): Promise<ChatResult> {
      const body: Record<string, unknown> = {
        model,
        max_tokens: 4096,
        messages: normalizeMessages(messages),
      };
      if (systemPrompt) {
        body.system = systemPrompt;
      }

      const response = await callAPI(body);
      const data = await response.json();
      return {
        content: data.content?.[0]?.text ?? '',
        usage: {
          inputTokens: data.usage?.input_tokens ?? 0,
          outputTokens: data.usage?.output_tokens ?? 0,
        },
      };
    },

    async testConnection(): Promise<void> {
      await callAPI({
        model,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }],
      });
    },
  };
}
