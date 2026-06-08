import { useEffect, useRef } from 'react';
import type { Message } from '../types/storage';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  onDraftContentChange?: (content: string) => void;
}

export default function MessageList({ messages, onDraftContentChange }: MessageListProps) {
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
            onDraftContentChange={
              m.status === 'draft' ? onDraftContentChange : undefined
            }
          />
        ))}
      <div ref={bottomRef} />
    </div>
  );
}
