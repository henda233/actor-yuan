import { useState, useEffect, useCallback, useRef } from 'react';
import type { ProviderType } from '../types/storage';
import {
  getProvider, setProvider,
  getApiKey, setApiKey,
  getApiBaseUrl, setApiBaseUrl,
  getModel, setModel,
  getBillingPrices, setBillingPrices,
  getSystemPrompt, setSystemPrompt,
  getDebugMode, setDebugMode,
} from '../services/configStorage';
import { createAIService } from '../services/aiService';
import { useDataStore } from '../services/dataStore';

export default function SettingsPanel() {
  const { exportData, importData } = useDataStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [provider, setProviderState] = useState<ProviderType>(getProvider);
  const [apiKey, setApiKeyState] = useState(getApiKey() ?? '');
  const [apiBaseUrl, setApiBaseUrlState] = useState(getApiBaseUrl());
  const [model, setModelState] = useState(getModel() ?? '');
  const [systemPrompt, setSystemPromptState] = useState(getSystemPrompt());
  const [promptError, setPromptError] = useState('');
  const [inputPrice, setInputPrice] = useState('0');
  const [outputPrice, setOutputPrice] = useState('0');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [debugMode, setDebugModeState] = useState(getDebugMode);

  useEffect(() => {
    const prices = getBillingPrices();
    const mp = prices[model] ?? { inputPrice: 0, outputPrice: 0 };
    setInputPrice(String(mp.inputPrice));
    setOutputPrice(String(mp.outputPrice));
  }, [model]);

  const handleProviderChange = (v: ProviderType) => {
    setProviderState(v);
    setProvider(v);
  };

  const handleApiKeyChange = (v: string) => {
    setApiKeyState(v);
    setApiKey(v);
  };

  const handleApiBaseUrlChange = (v: string) => {
    setApiBaseUrlState(v);
    setApiBaseUrl(v);
  };

  const handleModelChange = (v: string) => {
    setModelState(v);
    setModel(v);
  };

  const handleSystemPromptChange = (v: string) => {
    setSystemPromptState(v);
    if (!v.includes('{stage}')) {
      setPromptError('系统提示词必须包含 {stage} 占位符');
    } else {
      setPromptError('');
      setSystemPrompt(v);
    }
  };

  const handleSaveBilling = useCallback(() => {
    const prices = getBillingPrices();
    prices[model] = {
      inputPrice: Number(inputPrice) || 0,
      outputPrice: Number(outputPrice) || 0,
    };
    setBillingPrices(prices);
  }, [model, inputPrice, outputPrice]);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      await createAIService({
        provider,
        apiKey,
        apiBaseUrl,
        model,
      }).testConnection();
      setTestStatus('success');
      setTestMessage('连接成功');
    } catch (e) {
      setTestStatus('error');
      setTestMessage(e instanceof Error ? e.message : '连接失败');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
    } catch (err) {
      alert(err instanceof Error ? err.message : '导入失败');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="settings-panel">
      <div className="setting-group">
        <label className="setting-label">Provider</label>
        <select
          className="setting-select"
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value as ProviderType)}
        >
          <option value="mock">Mock（无 API 测试用）</option>
          <option value="openai">OpenAI 兼容</option>
          <option value="anthropic">Anthropic</option>
        </select>
      </div>

      <div className="setting-group">
        <label className="setting-label">API Key</label>
        <input
          className="setting-input"
          type="password"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder={provider === 'mock' ? 'Mock 模式无需 API Key' : '输入 API Key'}
        />
      </div>

      {provider === 'openai' && (
        <div className="setting-group">
          <label className="setting-label">Base URL</label>
          <input
            className="setting-input"
            type="text"
            value={apiBaseUrl}
            onChange={(e) => handleApiBaseUrlChange(e.target.value)}
            placeholder="https://api.openai.com/v1"
          />
        </div>
      )}

      <div className="setting-group">
        <label className="setting-label">Model ID</label>
        <input
          className="setting-input"
          type="text"
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          placeholder="gpt-4o-mini / claude-sonnet-4-6"
        />
      </div>

      <button
        type="button"
        className="btn btn-regenerate setting-test-btn"
        onClick={handleTestConnection}
        disabled={testStatus === 'testing' || (provider !== 'mock' && !apiKey)}
      >
        {testStatus === 'testing' ? '测试中...' : '测试连接'}
      </button>
      {testMessage && (
        <span className={`setting-test-msg ${testStatus === 'success' ? 'setting-test-ok' : 'setting-test-err'}`}>
          {testMessage}
        </span>
      )}

      <div className="setting-divider" />

      <div className="setting-group">
        <label className="setting-label">计费价格（每千 token）</label>
        <div className="setting-billing-row">
          <input
            className="setting-input setting-billing-input"
            type="number"
            min="0"
            step="0.001"
            value={inputPrice}
            onChange={(e) => setInputPrice(e.target.value)}
            placeholder="输入价格"
          />
          <span className="setting-billing-label">输入</span>
          <input
            className="setting-input setting-billing-input"
            type="number"
            min="0"
            step="0.001"
            value={outputPrice}
            onChange={(e) => setOutputPrice(e.target.value)}
            placeholder="输出价格"
          />
          <span className="setting-billing-label">输出</span>
          <button type="button" className="btn btn-confirm" onClick={handleSaveBilling}>
            保存
          </button>
        </div>
        <span className="setting-hint">当前模型：{model || '未设置'}</span>
      </div>

      <div className="setting-divider" />

      <div className="setting-group">
        <label className="setting-label">系统提示词</label>
        <textarea
          className="setting-textarea"
          value={systemPrompt}
          onChange={(e) => handleSystemPromptChange(e.target.value)}
          placeholder="设置 AI 主持人的系统提示词..."
          rows={8}
        />
        {promptError && <span className="setting-error">{promptError}</span>}
      </div>

      <div className="setting-divider" />

      <div className="setting-group">
        <label className="setting-label">Debug 模式</label>
        <span className="setting-hint">开启后在 TopBar 显示 Debug 按钮，可查看每次 AI 交互的完整输入内容（系统提示词 + 消息列表）</span>
        <label className="setting-checkbox-label">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => {
              setDebugModeState(e.target.checked);
              setDebugMode(e.target.checked);
            }}
          />
          <span>启用 Debug 面板</span>
        </label>
      </div>

      <div className="setting-divider" />

      <div className="setting-group">
        <label className="setting-label">数据管理</label>
        <div className="setting-io-row">
          <button type="button" className="btn btn-regenerate" onClick={exportData}>
            导出数据
          </button>
          <button type="button" className="btn btn-regenerate" onClick={() => fileInputRef.current?.click()}>
            导入数据
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
      </div>
    </div>
  );
}
