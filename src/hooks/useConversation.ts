import { useState, useCallback, useMemo } from 'react';
import { useDataStore } from '../services/dataStore';
import { getSystemPrompt } from '../services/configStorage';
import type { AIService } from '../services/aiService';
import {
  createMockProvider,
} from '../services/providers/mockProvider';
import {
  AIAuthError,
  AIRateLimitError,
  AINetworkError,
  AIAPIError,
} from '../services/aiService';
import type { Message } from '../types/storage';

export function useConversation(aiService?: AIService) {
  const { data, addMessage, updateMessage, deleteMessage } = useDataStore();
  const service = aiService ?? createMockProvider();

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
        const { content: aiContent, usage } = await service.chat(
          messagesForAI,
          getSystemPrompt(),
        );
        console.debug('[useConversation] token usage:', usage);
        addMessage('assistant', aiContent, 'draft');
        setPhase('reviewing_draft');
      } catch (e) {
        if (e instanceof AIAuthError) {
          setError('API Key 无效，请检查配置');
        } else if (e instanceof AIRateLimitError) {
          setError('API 调用频率超限，请稍后重试');
        } else if (e instanceof AINetworkError) {
          setError('网络连接失败，请检查网络状态');
        } else if (e instanceof AIAPIError) {
          setError(`API 服务异常 (${e.statusCode}): ${e.message}`);
        } else {
          setError(e instanceof Error ? e.message : 'AI 服务调用失败');
        }
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

  const discardDraft = useCallback(() => {
    if (phase !== 'reviewing_draft' || !draftMessage) {
      throw new Error('当前没有待确认的草稿');
    }
    deleteMessage(draftMessage.id);
    setPhase('chatting');
  }, [phase, draftMessage, deleteMessage]);

  const regenerateDraft = useCallback(async () => {
    if (phase !== 'reviewing_draft' || !draftMessage) {
      throw new Error('当前没有待确认的草稿');
    }
    setError(null);
    setLoading(true);

    const validMessages = data.messages.filter(
      (m) => m.role !== 'system' && m.status !== 'draft',
    );

    deleteMessage(draftMessage.id);

    try {
      const { content: aiContent, usage } = await service.chat(
        validMessages,
        getSystemPrompt(),
      );
      console.debug('[useConversation] token usage:', usage);
      addMessage('assistant', aiContent, 'draft');
    } catch (e) {
      if (e instanceof AIAuthError) {
        setError('API Key 无效，请检查配置');
      } else if (e instanceof AIRateLimitError) {
        setError('API 调用频率超限，请稍后重试');
      } else if (e instanceof AINetworkError) {
        setError('网络连接失败，请检查网络状态');
      } else if (e instanceof AIAPIError) {
        setError(`API 服务异常 (${e.statusCode}): ${e.message}`);
      } else {
        setError(e instanceof Error ? e.message : 'AI 服务调用失败');
      }
    } finally {
      setLoading(false);
    }
  }, [phase, draftMessage, data.messages, deleteMessage, addMessage, service]);

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
    discardDraft,
    regenerateDraft,
    confirmDraft,
  };
}
