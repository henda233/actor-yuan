import { useState, useCallback, useMemo } from 'react';
import { useDataStore } from '../services/dataStore';
import { getSystemPrompt } from '../services/configStorage';
import type { AIService } from '../services/aiService';
import { createMockAIService } from '../services/aiService';
import type { Message } from '../types/storage';

export function useConversation(aiService?: AIService) {
  const { data, addMessage, updateMessage } = useDataStore();
  const service = aiService ?? createMockAIService();

  const [phase, setPhase] = useState<'chatting' | 'reviewing_draft'>(() =>
    data.messages.some((m) => m.status === 'draft') ? 'reviewing_draft' : 'chatting',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftMessage = useMemo(
    () => data.messages.find((m) => m.status === 'draft') ?? null,
    [data.messages],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (phase !== 'chatting') {
        throw new Error('当前有待确认的草稿，请先确认或处理后再发送新消息');
      }
      setError(null);
      setLoading(true);

      addMessage('user', content);

      const validMessages = data.messages.filter(
        (m) => m.role !== 'system' && m.status !== 'draft',
      );
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      const messagesForAI = [...validMessages, userMsg];

      try {
        const response = await service.chat(messagesForAI, getSystemPrompt());
        addMessage('assistant', response, 'draft');
        setPhase('reviewing_draft');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'AI 服务调用失败');
      } finally {
        setLoading(false);
      }
    },
    [phase, data.messages, addMessage, service],
  );

  const insertIntoDraft = useCallback(
    (position: number, text: string) => {
      if (phase !== 'reviewing_draft' || !draftMessage) {
        throw new Error('当前没有待确认的草稿');
      }
      const content = draftMessage.content;
      const newContent = content.slice(0, position) + text + content.slice(position);
      updateMessage(draftMessage.id, { content: newContent });
    },
    [phase, draftMessage, updateMessage],
  );

  const confirmDraft = useCallback(() => {
    if (phase !== 'reviewing_draft' || !draftMessage) {
      throw new Error('当前没有待确认的草稿');
    }
    updateMessage(draftMessage.id, { status: 'confirmed' });
    setPhase('chatting');
  }, [phase, draftMessage, updateMessage]);

  return {
    phase,
    messages: data.messages,
    loading,
    error,
    draftMessage,
    sendMessage,
    insertIntoDraft,
    confirmDraft,
  };
}
