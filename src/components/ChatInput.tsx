import { useState } from 'react';
import type { LoadingStage } from '../hooks/useConversation';

interface ChatInputProps {
  loading: boolean;
  loadingStage: LoadingStage;
  pendingReasoning: boolean;
  onSend: (content: string) => void;
  onRetryNarrative: () => void;
  onCancelPending: () => void;
}

export default function ChatInput({
  loading,
  loadingStage,
  pendingReasoning,
  onSend,
  onRetryNarrative,
  onCancelPending,
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading || pendingReasoning) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadingText = loadingStage === 'reasoning'
    ? 'AI 正在推演剧情思路...'
    : 'AI 正在输出游戏情节...';

  if (pendingReasoning) {
    return (
      <div className="chat-input-bar">
        <div className="chat-retry-hint">情节生成失败，推演方案已保留</div>
        <div className="chat-retry-actions">
          <button
            type="button"
            className="btn btn-discard"
            onClick={onCancelPending}
          >
            取消
          </button>
          <button
            type="button"
            className="btn btn-regenerate"
            onClick={onRetryNarrative}
          >
            重试生成情节
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-input-bar">
      <textarea
        className="chat-input-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你的操作..."
        rows={3}
        disabled={loading}
      />
      <button
        type="button"
        className="chat-input-send"
        onClick={handleSend}
        disabled={loading || !input.trim()}
      >
        {loading ? loadingText : '发送'}
      </button>
    </div>
  );
}
