import type { Message, ChatResult } from '../../types/storage';
import { AINetworkError, handleAPIError } from '../aiService';
import type { AIService } from '../aiService';

export function createOpenAIProvider(apiKey: string, apiBaseUrl: string, model: string): AIService {
  const endpoint = apiBaseUrl.replace(/\/+$/, '') + '/chat/completions';

  const callAPI = async (body: unknown): Promise<Response> => {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
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
      const apiMessages: { role: string; content: string }[] = [];
      if (systemPrompt) {
        apiMessages.push({ role: 'system', content: systemPrompt });
      }
      for (const m of messages) {
        apiMessages.push({ role: m.role, content: m.content });
      }

      const response = await callAPI({ model, messages: apiMessages });
      const data = await response.json();
      return {
        content: data.choices?.[0]?.message?.content ?? '',
        usage: {
          inputTokens: data.usage?.prompt_tokens ?? 0,
          outputTokens: data.usage?.completion_tokens ?? 0,
        },
      };
    },

    async testConnection(): Promise<void> {
      await callAPI({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      });
    },
  };
}
