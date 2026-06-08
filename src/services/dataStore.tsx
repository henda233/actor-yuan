import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppData, ExportData, Message } from '../types/storage';

interface DataStoreContextValue {
  data: AppData;
  dirty: boolean;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  addMessage: (role: Message['role'], content: string) => void;
  setModule: (text: string) => void;
}

const initialData: AppData = { module: '', messages: [] };

const DataStoreContext = createContext<DataStoreContextValue | null>(null);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [dirty, setDirty] = useState(false);

  const exportData = useCallback(() => {
    const exportObj: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      module: data.module,
      messages: data.messages,
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
    let parsed: ExportData;
    try {
      parsed = JSON.parse(text) as ExportData;
    } catch {
      throw new Error('JSON 解析失败，请检查文件格式');
    }
    setData({
      module: parsed.module ?? '',
      messages: parsed.messages ?? [],
    });
    setDirty(false);
  }, []);

  const addMessage = useCallback((role: Message['role'], content: string) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: Date.now(),
    };
    setData((prev) => ({
      ...prev,
      messages: [...prev.messages, msg],
    }));
    setDirty(true);
  }, []);

  const setModule = useCallback((text: string) => {
    setData((prev) => ({ ...prev, module: text }));
    setDirty(true);
  }, []);

  return (
    <DataStoreContext.Provider
      value={{ data, dirty, exportData, importData, addMessage, setModule }}
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
