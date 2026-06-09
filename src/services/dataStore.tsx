import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppData, ExportData, Message, MessageBilling, SessionBilling } from '../types/storage';

export function generateUUID(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const toHex = (b: number) => b.toString(16).padStart(2, '0');
  return [
    bytes.slice(0, 4),
    bytes.slice(4, 6),
    bytes.slice(6, 8),
    bytes.slice(8, 10),
    bytes.slice(10, 16),
  ].map((seg) => Array.from(seg, toHex).join('')).join('-');
}

interface DataStoreContextValue {
  data: AppData;
  dirty: boolean;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  addMessage: (role: Message['role'], content: string, status?: Message['status'], reasoning?: string, billing?: MessageBilling) => void;
  updateMessage: (id: string, patch: Partial<Pick<Message, 'content' | 'status' | 'reasoning' | 'billing'>>) => void;
  deleteMessage: (id: string) => void;
  setModule: (text: string) => void;
  appendContextHistory: (text: string) => void;
  setContextHistory: (text: string) => void;
  setContextHistoryEntry: (index: number, text: string) => void;
  deleteContextHistoryEntry: (index: number) => void;
  resetMessages: (messages: Message[]) => void;
  addSessionBilling: (billing: MessageBilling) => void;
  resetBilling: () => void;
}

const initialData: AppData = { module: '', messages: [], contextHistory: '', billing: { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 } };

const DataStoreContext = createContext<DataStoreContextValue | null>(null);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [dirty, setDirty] = useState(false);

  const exportData = useCallback(() => {
    const exportObj: ExportData = {
      version: 3,
      exportedAt: new Date().toISOString(),
      module: data.module,
      messages: data.messages,
      contextHistory: data.contextHistory,
      billing: data.billing,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actor-yuan-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDirty(false);
  }, [data]);

  const importData = useCallback(async (file: File) => {
    const text = await file.text();
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('JSON 解析失败，请检查文件格式');
    }

    const module = (parsed.module as string) ?? '';
    const rawMessages = (parsed.messages as Message[]) ?? [];
    let contextHistory = (parsed.contextHistory as string) ?? '';
    const version = (parsed.version as number) ?? 1;
    const billing: SessionBilling = version >= 3
      ? ((parsed.billing as SessionBilling) ?? { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 })
      : { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 };

    // 迁移旧版数据（version 1，无 contextHistory）
    if (!contextHistory && rawMessages.length > 0) {
      const nonSystem = rawMessages.filter((m) => m.role !== 'system');
      // 找到最后一对 user+assistant 的索引
      let lastPairStart = nonSystem.length;
      for (let i = nonSystem.length - 1; i >= 0; i--) {
        if (nonSystem[i].role === 'user') {
          lastPairStart = i;
          break;
        }
      }
      // 最后一对之前的已确认 assistant 内容 → contextHistory
      const historyParts: string[] = [];
      for (let i = 0; i < lastPairStart; i++) {
        if (nonSystem[i].role === 'assistant' && nonSystem[i].status === 'confirmed') {
          historyParts.push(nonSystem[i].content);
        }
      }
      contextHistory = historyParts.join('\n\n');

      // 保留最后一对 user+assistant
      const migratedMessages = nonSystem.slice(lastPairStart);
      // 如果最后一条 assistant 非 draft，视为已确认，内容加入 contextHistory
      const lastMsg = migratedMessages[migratedMessages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.status !== 'draft') {
        contextHistory = contextHistory ? `${contextHistory}\n\n${lastMsg.content}` : lastMsg.content;
        migratedMessages.pop();
      }

      setData({ module, messages: migratedMessages, contextHistory, billing });
    } else {
      setData({ module, messages: rawMessages, contextHistory, billing });
    }
    setDirty(false);
  }, []);

  const addMessage = useCallback((role: Message['role'], content: string, status?: Message['status'], reasoning?: string, billing?: MessageBilling) => {
    const msg: Message = {
      id: generateUUID(),
      role,
      content,
      timestamp: Date.now(),
      status,
      reasoning,
      billing,
    };
    setData((prev) => ({
      ...prev,
      messages: [...prev.messages, msg],
    }));
    setDirty(true);
  }, []);

  const updateMessage = useCallback((id: string, patch: Partial<Pick<Message, 'content' | 'status' | 'reasoning'>>) => {
    setData((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    }));
    setDirty(true);
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== id),
    }));
    setDirty(true);
  }, []);

  const setModule = useCallback((text: string) => {
    setData((prev) => ({ ...prev, module: text }));
    setDirty(true);
  }, []);

  const setContextHistory = useCallback((text: string) => {
    setData((prev) => ({ ...prev, contextHistory: text }));
    setDirty(true);
  }, []);

  const setContextHistoryEntry = useCallback((index: number, text: string) => {
    setData((prev) => {
      const entries = prev.contextHistory ? prev.contextHistory.split('\n\n') : [];
      if (index < 0 || index >= entries.length) return prev;
      entries[index] = text;
      return { ...prev, contextHistory: entries.join('\n\n') };
    });
    setDirty(true);
  }, []);

  const deleteContextHistoryEntry = useCallback((index: number) => {
    setData((prev) => {
      const entries = prev.contextHistory ? prev.contextHistory.split('\n\n') : [];
      if (index < 0 || index >= entries.length) return prev;
      entries.splice(index, 1);
      return { ...prev, contextHistory: entries.join('\n\n') };
    });
    setDirty(true);
  }, []);

  const appendContextHistory = useCallback((text: string) => {
    setData((prev) => ({
      ...prev,
      contextHistory: prev.contextHistory ? `${prev.contextHistory}\n\n${text}` : text,
    }));
    setDirty(true);
  }, []);

  const resetMessages = useCallback((messages: Message[]) => {
    setData((prev) => ({ ...prev, messages }));
    setDirty(true);
  }, []);

  const addSessionBilling = useCallback((billing: MessageBilling) => {
    setData((prev) => ({
      ...prev,
      billing: {
        totalInputTokens: prev.billing.totalInputTokens + billing.inputTokens,
        totalOutputTokens: prev.billing.totalOutputTokens + billing.outputTokens,
        totalCost: prev.billing.totalCost + billing.cost,
      },
    }));
    setDirty(true);
  }, []);

  const resetBilling = useCallback(() => {
    setData((prev) => ({
      ...prev,
      billing: { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 },
    }));
    setDirty(true);
  }, []);

  return (
    <DataStoreContext.Provider
      value={{ data, dirty, exportData, importData, addMessage, updateMessage, deleteMessage, setModule, setContextHistory, appendContextHistory, setContextHistoryEntry, deleteContextHistoryEntry, resetMessages, addSessionBilling, resetBilling }}
    >
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore(): DataStoreContextValue {
  const ctx = useContext(DataStoreContext);
  if (!ctx) {
    throw new Error('useDataStore must be used within DataStoreProvider');
  }
  return ctx;
}
