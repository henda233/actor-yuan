import type { Message } from '../types/storage';

export interface AIService {
  chat(messages: Message[], systemPrompt: string): Promise<string>;
}

export function createMockAIService(): AIService {
  return {
    async chat(_messages: Message[], _systemPrompt: string): Promise<string> {
      await new Promise((r) => setTimeout(r, 500));
      return '[MOCK] 你推开厚重的石门，一股腐朽的气息扑面而来。借着微弱的火光，你看到前方是一个宽阔的大厅，地面上散落着碎裂的骨骼。大厅的尽头，一双猩红的眼睛正注视着你。';
    },
  };
}
