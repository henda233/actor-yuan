import { useState, useCallback, useMemo } from 'react';
import { useDataStore } from '../services/dataStore';
import { buildSystemPrompt, getDebugMode } from '../services/configStorage';
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

export type LoadingStage = 'idle' | 'reasoning' | 'narrating';

export interface DebugEntry {
  systemPrompt: string;
  messages: Message[];
  stage: string;
  timestamp: number;
}

export interface DebugEntries {
  reasoning?: DebugEntry;
  narrative?: DebugEntry;
}

export function useConversation(aiService?: AIService) {
  const { data, addMessage, updateMessage, deleteMessage } = useDataStore();
  const service = aiService ?? createMockProvider();

  const [phase, setPhase] = useState<'chatting' | 'reviewing_draft'>(() =>
    data.messages.some((m) => m.status === 'draft') ? 'reviewing_draft' : 'chatting',
  );
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pendingReasoning, setPendingReasoning] = useState<string | null>(null);
  const [debugEntries, setDebugEntries] = useState<DebugEntries>({});

  const draftMessage = useMemo(
    () => data.messages.find((m) => m.status === 'draft') ?? null,
    [data.messages],
  );

  const loading = loadingStage !== 'idle';

  const handleError = useCallback((e: unknown) => {
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
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (phase !== 'chatting') {
        throw new Error('当前有待确认的草稿，请先确认或处理后再发送新消息');
      }
      if (pendingReasoning) {
        throw new Error('推演方案已生成，请重试生成情节或取消');
      }
      setError(null);
      setLoadingStage('reasoning');

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
        if (getDebugMode()) {
          setDebugEntries({
            reasoning: {
              systemPrompt: buildSystemPrompt('推演方案制定'),
              messages: messagesForAI,
              stage: '推演方案制定',
              timestamp: Date.now(),
            },
          });
        }

        const { content: reasoning } = await service.chat(
          messagesForAI,
          buildSystemPrompt('推演方案制定'),
        );

        setLoadingStage('narrating');

        try {
          if (getDebugMode()) {
            setDebugEntries(prev => ({
              ...prev,
              narrative: {
                systemPrompt: buildSystemPrompt('游戏情节推演', reasoning),
                messages: messagesForAI,
                stage: '游戏情节推演',
                timestamp: Date.now(),
              },
            }));
          }

          const { content: narrative, usage } = await service.chat(
            messagesForAI,
            buildSystemPrompt('游戏情节推演', reasoning),
          );
          console.debug('[useConversation] token usage:', usage);
          addMessage('assistant', narrative, 'draft', reasoning);
          setPhase('reviewing_draft');
        } catch (e) {
          setPendingReasoning(reasoning);
          handleError(e);
        }
      } catch (e) {
        handleError(e);
      } finally {
        setLoadingStage('idle');
      }
    },
    [phase, pendingReasoning, data.messages, addMessage, service, handleError],
  );

  const retryNarrative = useCallback(async () => {
    if (!pendingReasoning) return;
    setError(null);
    setLoadingStage('narrating');

    const validMessages = data.messages.filter(
      (m) => m.role !== 'system' && m.status !== 'draft',
    );

    try {
      if (getDebugMode()) {
        setDebugEntries(prev => ({
          ...prev,
          narrative: {
            systemPrompt: buildSystemPrompt('游戏情节推演', pendingReasoning),
            messages: validMessages,
            stage: '游戏情节推演',
            timestamp: Date.now(),
          },
        }));
      }

      const { content: narrative, usage } = await service.chat(
        validMessages,
        buildSystemPrompt('游戏情节推演', pendingReasoning),
      );
      console.debug('[useConversation] token usage:', usage);
      addMessage('assistant', narrative, 'draft', pendingReasoning);
      setPendingReasoning(null);
      setPhase('reviewing_draft');
    } catch (e) {
      handleError(e);
    } finally {
      setLoadingStage('idle');
    }
  }, [pendingReasoning, data.messages, addMessage, service, handleError]);

  const cancelPendingReasoning = useCallback(() => {
    const messages = data.messages;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      deleteMessage(lastMessage.id);
    }
    setPendingReasoning(null);
    setError(null);
  }, [data.messages, deleteMessage]);

  const setDraftContent = useCallback(
    (content: string) => {
      if (!draftMessage) return;
      updateMessage(draftMessage.id, { content });
    },
    [draftMessage, updateMessage],
  );

  const discardDraft = useCallback(() => {
    if (phase !== 'reviewing_draft' || !draftMessage) {
      throw new Error('当前没有待确认的草稿');
    }
    const messages = data.messages;
    const draftIndex = messages.findIndex((m) => m.id === draftMessage.id);
    if (draftIndex > 0 && messages[draftIndex - 1].role === 'user') {
      deleteMessage(messages[draftIndex - 1].id);
    }
    deleteMessage(draftMessage.id);
    setPendingReasoning(null);
    setPhase('chatting');
  }, [phase, draftMessage, data.messages, deleteMessage]);

  const regenerateDraft = useCallback(async () => {
    if (phase !== 'reviewing_draft' || !draftMessage) {
      throw new Error('当前没有待确认的草稿');
    }
    const reasoning = draftMessage.reasoning;
    setError(null);
    setLoadingStage('narrating');

    const validMessages = data.messages.filter(
      (m) => m.role !== 'system' && m.status !== 'draft',
    );

    deleteMessage(draftMessage.id);

    try {
      if (getDebugMode()) {
        setDebugEntries(prev => ({
          ...prev,
          narrative: {
            systemPrompt: buildSystemPrompt('游戏情节推演', reasoning),
            messages: validMessages,
            stage: '游戏情节推演',
            timestamp: Date.now(),
          },
        }));
      }

      const { content: narrative, usage } = await service.chat(
        validMessages,
        buildSystemPrompt('游戏情节推演', reasoning),
      );
      console.debug('[useConversation] token usage:', usage);
      addMessage('assistant', narrative, 'draft', reasoning);
    } catch (e) {
      handleError(e);
    } finally {
      setLoadingStage('idle');
    }
  }, [phase, draftMessage, data.messages, deleteMessage, addMessage, service, handleError]);

  const confirmDraft = useCallback(() => {
    if (phase !== 'reviewing_draft' || !draftMessage) {
      throw new Error('当前没有待确认的草稿');
    }
    updateMessage(draftMessage.id, { status: 'confirmed', reasoning: undefined });
    setPhase('chatting');
  }, [phase, draftMessage, updateMessage]);

  const clearDebugEntries = useCallback(() => {
    setDebugEntries({});
  }, []);

  return {
    phase,
    messages: data.messages,
    loading,
    loadingStage,
    error,
    draftMessage,
    pendingReasoning,
    debugEntries,
    sendMessage,
    retryNarrative,
    cancelPendingReasoning,
    setDraftContent,
    discardDraft,
    regenerateDraft,
    confirmDraft,
    clearDebugEntries,
  };
}
