import type { Message, ChatResult } from '../../types/storage';
import type { AIService } from '../aiService';

const MOCK_REASONING = `1. 玩家推进方向：角色选择推门进入大厅，属于探索行为。
2. 当前局势分析：大厅内有碎裂骨骼暗示危险，猩红双眼预示有敌人或陷阱。
3. 推演思路：先渲染环境氛围营造沉浸感，暗示潜在威胁但不立即触发战斗。
4. 可能的发展方向：角色可继续前进调查、尝试与眼睛的主人交涉、或选择撤退。`;

const MOCK_NARRATIVE = `你推开厚重的石门，一股腐朽的气息扑面而来。借着微弱的火光，你看到前方是一个宽阔的大厅，地面上散落着碎裂的骨骼，有些还残留着被啃咬过的痕迹。大厅的尽头，一双猩红的眼睛正注视着你，伴随着低沉的呜咽声，一个庞大的黑影缓缓从阴影中走出。`;

export function createMockProvider(): AIService {
  let callCount = 0;

  return {
    async chat(_messages: Message[], systemPrompt: string): Promise<ChatResult> {
      await new Promise((r) => setTimeout(r, 500));
      callCount++;

      if (systemPrompt.includes('当前阶段：推演方案制定')) {
        return {
          content: MOCK_REASONING,
          usage: { inputTokens: 150, outputTokens: 80 },
        };
      }

      return {
        content: MOCK_NARRATIVE,
        usage: { inputTokens: 200, outputTokens: 100 },
      };
    },

    async testConnection(): Promise<void> {
      await new Promise((r) => setTimeout(r, 300));
    },
  };
}
