import { useEffect, useRef } from 'react';
import type { Message } from '../types/storage';
import type { Phase, LoadingStage } from '../hooks/useConversation';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  phase: Phase;
  loading: boolean;
  loadingStage: LoadingStage;
  onRegenerate: () => void;
  onDiscard: () => void;
  onStartEdit: () => void;
  onConfirm: () => void;
  onSaveEdit: (content: string) => void;
  onCancelEdit: () => void;
}

export default function MessageList({
  messages,
  phase,
  loading,
  loadingStage,
  onRegenerate,
  onDiscard,
  onStartEdit,
  onConfirm,
  onSaveEdit,
  onCancelEdit,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="msg-list">
      {messages.length === 0 && (
        <div className="msg-empty">开始一段新的冒险吧。</div>
      )}
      {messages
        .filter((m) => m.role !== 'system')
        .map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            phase={phase}
            loading={loading}
            loadingStage={loadingStage}
            onRegenerate={onRegenerate}
            onDiscard={onDiscard}
            onStartEdit={onStartEdit}
            onConfirm={onConfirm}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
          />
        ))}
      <div ref={bottomRef} />
    </div>
  );
}
