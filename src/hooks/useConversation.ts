import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useDataStore } from '../services/dataStore';
import { buildSystemPrompt, getDebugMode, getDraftEditRewriteMode, getBillingPrices, getModel } from '../services/configStorage';
import { calculateCost } from '../services/billingService';
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
import type { Message, MessageBilling } from '../types/storage';

export type Phase = 'chatting' | 'reviewing_draft' | 'editing_draft';
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

function extractBeforeBracket(content: string): string | null {
  const idx = content.indexOf('【');
  if (idx <= 0) return null;
  return content.slice(0, idx);
}

function makeBilling(inputTokens: number, outputTokens: number): MessageBilling {
  const prices = getBillingPrices();
  const price = prices[getModel() ?? ''] ?? { inputPrice: 0, outputPrice: 0 };
  return {
    inputTokens,
    outputTokens,
    cost: calculateCost(inputTokens, outputTokens, price.inputPrice, price.outputPrice),
  };
}

export function useConversation(aiService?: AIService) {
  const {
    data,
    addMessage,
    updateMessage,
    deleteMessage,
    appendContextHistory,
    resetMessages,
    addSessionBilling,
  } = useDataStore();
  const service = aiService ?? createMockProvider();

  const [phase, setPhase] = useState<Phase>(() =>
    data.messages.some((m) => m.status === 'draft') ? 'reviewing_draft' : 'chatting',
  );
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pendingReasoning, setPendingReasoning] = useState<string | null>(null);
  const [debugEntries, setDebugEntries] = useState<DebugEntries>({});
  const originalDraftRef = useRef<string>('');

  const draftMessage = useMemo(
    () => data.messages.find((m) => m.status === 'draft') ?? null,
    [data.messages],
  );

  const loading = loadingStage !== 'idle';

  useEffect(() => {
    const hasDraft = data.messages.some((m) => m.status === 'draft');
    if (!hasDraft && (phase === 'reviewing_draft' || phase === 'editing_draft')) {
      setPhase('chatting');
    } else if (hasDraft && phase === 'chatting') {
      setPhase('reviewing_draft');
    }
  }, [data.messages, phase]);

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

  const buildUserContent = useCallback((playerAction: string) => {
    const ctx = data.contextHistory;
    const ctxLine = ctx ? `上下文（历史情节）：\n${ctx}` : '上下文（历史情节）：';
    return `${ctxLine}\n\n玩家操作：\n${playerAction}`;
  }, [data.contextHistory]);

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

      const userContent = buildUserContent(content);
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userContent,
        timestamp: Date.now(),
      };
      const messagesForAI: Message[] = [userMsg];

      resetMessages([userMsg]);

      try {
        if (getDebugMode()) {
          setDebugEntries({
            reasoning: {
              systemPrompt: buildSystemPrompt('推演方案制定', data.module),
              messages: messagesForAI,
              stage: '推演方案制定',
              timestamp: Date.now(),
            },
          });
        }

        const { content: reasoning, usage: reasoningUsage } = await service.chat(
          messagesForAI,
          buildSystemPrompt('推演方案制定', data.module),
        );

        setLoadingStage('narrating');

        try {
          if (getDebugMode()) {
            setDebugEntries(prev => ({
              ...prev,
              narrative: {
                systemPrompt: buildSystemPrompt('游戏情节推演', data.module, reasoning),
                messages: messagesForAI,
                stage: '游戏情节推演',
                timestamp: Date.now(),
              },
            }));
          }

          const { content: narrative, usage: narrativeUsage } = await service.chat(
            messagesForAI,
            buildSystemPrompt('游戏情节推演', data.module, reasoning),
          );
          const billing = makeBilling(
            reasoningUsage.inputTokens + narrativeUsage.inputTokens,
            reasoningUsage.outputTokens + narrativeUsage.outputTokens,
          );
          addMessage('assistant', narrative, 'draft', reasoning, billing);
          addSessionBilling(billing);
          setPhase('reviewing_draft');
        } catch (e) {
          addSessionBilling(makeBilling(reasoningUsage.inputTokens, reasoningUsage.outputTokens));
          setPendingReasoning(reasoning);
          handleError(e);
        }
      } catch (e) {
        handleError(e);
      } finally {
        setLoadingStage('idle');
      }
    },
    [phase, pendingReasoning, data.module, buildUserContent, addMessage, addSessionBilling, resetMessages, service, handleError],
  );

  const retryNarrative = useCallback(async () => {
    if (!pendingReasoning) return;
    setError(null);
    setLoadingStage('narrating');

    const messagesForAI = data.messages;

    try {
      if (getDebugMode()) {
        setDebugEntries(prev => ({
          ...prev,
          narrative: {
            systemPrompt: buildSystemPrompt('游戏情节推演', data.module, pendingReasoning),
            messages: messagesForAI,
            stage: '游戏情节推演',
            timestamp: Date.now(),
          },
        }));
      }

      const { content: narrative, usage } = await service.chat(
        messagesForAI,
        buildSystemPrompt('游戏情节推演', data.module, pendingReasoning),
      );
      const billing = makeBilling(usage.inputTokens, usage.outputTokens);
      addMessage('assistant', narrative, 'draft', pendingReasoning, billing);
      addSessionBilling(billing);
      setPendingReasoning(null);
      setPhase('reviewing_draft');
    } catch (e) {
      handleError(e);
    } finally {
      setLoadingStage('idle');
    }
  }, [pendingReasoning, data.messages, data.module, addMessage, addSessionBilling, service, handleError]);

  const cancelPendingReasoning = useCallback(() => {
    setPendingReasoning(null);
    setError(null);
  }, []);

  const confirmDraft = useCallback(() => {
    if (phase !== 'reviewing_draft' || !draftMessage) {
      throw new Error('当前没有待确认的草稿');
    }
    appendContextHistory(draftMessage.content);
    updateMessage(draftMessage.id, { status: 'confirmed', reasoning: undefined });
    setPendingReasoning(null);
    setPhase('chatting');
  }, [phase, draftMessage, appendContextHistory, updateMessage]);

  const discardDraft = useCallback(() => {
    if (phase !== 'reviewing_draft' || !draftMessage) {
      throw new Error('当前没有待确认的草稿');
    }
    deleteMessage(draftMessage.id);
    setPendingReasoning(null);
    setPhase('chatting');
  }, [phase, draftMessage, deleteMessage]);

  const regenerateDraft = useCallback(async () => {
    if (phase !== 'reviewing_draft' || !draftMessage) {
      throw new Error('当前没有待确认的草稿');
    }
    const reasoning = draftMessage.reasoning;
    setError(null);
    setLoadingStage('narrating');

    const messagesForAI = data.messages.filter((m) => m.status !== 'draft');
    deleteMessage(draftMessage.id);

    try {
      if (getDebugMode()) {
        setDebugEntries(prev => ({
          ...prev,
          narrative: {
            systemPrompt: buildSystemPrompt('游戏情节推演', data.module, reasoning),
            messages: messagesForAI,
            stage: '游戏情节推演',
            timestamp: Date.now(),
          },
        }));
      }

      const { content: narrative, usage } = await service.chat(
        messagesForAI,
        buildSystemPrompt('游戏情节推演', data.module, reasoning),
      );
      const billing = makeBilling(usage.inputTokens, usage.outputTokens);
      addMessage('assistant', narrative, 'draft', reasoning, billing);
      addSessionBilling(billing);
    } catch (e) {
      handleError(e);
    } finally {
      setLoadingStage('idle');
    }
  }, [phase, draftMessage, data.messages, data.module, deleteMessage, addMessage, addSessionBilling, service, handleError]);

  const startEditingDraft = useCallback(() => {
    if (phase !== 'reviewing_draft' || !draftMessage) {
      throw new Error('当前没有待确认的草稿');
    }
    originalDraftRef.current = draftMessage.content;
    setPhase('editing_draft');
  }, [phase, draftMessage]);

  const cancelEditingDraft = useCallback(() => {
    if (phase !== 'editing_draft' || !draftMessage) return;
    updateMessage(draftMessage.id, { content: originalDraftRef.current });
    setPhase('reviewing_draft');
  }, [phase, draftMessage, updateMessage]);

  const saveEditedDraft = useCallback(async (editedContent: string) => {
    if (phase !== 'editing_draft' || !draftMessage) {
      throw new Error('当前没有正在编辑的草稿');
    }

    const beforeBracket = extractBeforeBracket(editedContent);
    if (beforeBracket) {
      appendContextHistory(beforeBracket);
    }

    setError(null);
    const mode = getDraftEditRewriteMode();
    const messagesForAI = data.messages.filter((m) => m.status !== 'draft');
    const module = data.module;

    if (mode === 'narrative-only' && draftMessage.reasoning) {
      setLoadingStage('narrating');

      const sysPrompt = buildSystemPrompt('游戏情节推演', module, draftMessage.reasoning)
        + `\n\n## 需要重写的草稿\n${editedContent}`;

      try {
        const { content: narrative, usage } = await service.chat(messagesForAI, sysPrompt);
        const billing = makeBilling(usage.inputTokens, usage.outputTokens);
        updateMessage(draftMessage.id, { content: narrative, billing });
        addSessionBilling(billing);
        setPhase('reviewing_draft');
      } catch (e) {
        handleError(e);
      } finally {
        setLoadingStage('idle');
      }
    } else {
      setLoadingStage('reasoning');

      try {
        const { content: reasoning, usage: reasoningUsage } = await service.chat(
          messagesForAI,
          buildSystemPrompt('推演方案制定', module),
        );

        setLoadingStage('narrating');

        const sysPrompt = buildSystemPrompt('游戏情节推演', module, reasoning)
          + `\n\n## 需要重写的草稿\n${editedContent}`;

        try {
          const { content: narrative, usage: narrativeUsage } = await service.chat(messagesForAI, sysPrompt);
          const billing = makeBilling(
            reasoningUsage.inputTokens + narrativeUsage.inputTokens,
            reasoningUsage.outputTokens + narrativeUsage.outputTokens,
          );
          updateMessage(draftMessage.id, { content: narrative, reasoning, billing });
          addSessionBilling(billing);
          setPhase('reviewing_draft');
        } catch (e) {
          addSessionBilling(makeBilling(reasoningUsage.inputTokens, reasoningUsage.outputTokens));
          setPendingReasoning(reasoning);
          handleError(e);
        }
      } catch (e) {
        handleError(e);
      } finally {
        setLoadingStage('idle');
      }
    }
  }, [phase, draftMessage, data.messages, data.module, appendContextHistory, updateMessage, addSessionBilling, service, handleError]);

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
    discardDraft,
    regenerateDraft,
    confirmDraft,
    startEditingDraft,
    cancelEditingDraft,
    saveEditedDraft,
    clearDebugEntries,
  };
}
