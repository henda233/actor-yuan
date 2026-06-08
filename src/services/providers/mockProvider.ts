import type { Message, ChatResult } from '../../types/storage';
import type { AIService } from '../aiService';

export function createMockProvider(): AIService {
  return {
    async chat(_messages: Message[], _systemPrompt: string): Promise<ChatResult> {
      await new Promise((r) => setTimeout(r, 500));
      return {
        content:
          '[MOCK] 你推开厚重的石门，一股腐朽的气息扑面而来。借着微弱的火光，你看到前方是一个宽阔的大厅，地面上散落着碎裂的骨骼。大厅的尽头，一双猩红的眼睛正注视着你。',
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    },

    async testConnection(): Promise<void> {
      await new Promise((r) => setTimeout(r, 300));
    },
  };
}
