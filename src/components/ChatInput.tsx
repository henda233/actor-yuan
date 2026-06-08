import { useState } from 'react';

interface ChatInputProps {
  loading: boolean;
  onSend: (content: string) => void;
}

export default function ChatInput({ loading, onSend }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-bar">
      <textarea
        className="chat-input-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你的操作..."
        rows={2}
        disabled={loading}
      />
      <button
        type="button"
        className="chat-input-send"
        onClick={handleSend}
        disabled={loading || !input.trim()}
      >
        {loading ? '发送中...' : '发送'}
      </button>
    </div>
  );
}
