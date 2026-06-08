import { useEffect, useRef } from 'react';
import type { Message } from '../types/storage';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  draftInserted?: boolean;
  onDraftContextMenu?: (e: React.MouseEvent, messageId: string, paragraphIndex: number) => void;
}

export default function MessageList({ messages, draftInserted, onDraftContextMenu }: MessageListProps) {
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
            draftInserted={m.status === 'draft' ? draftInserted : undefined}
            onParagraphContextMenu={
              m.status === 'draft'
                ? (e, pi) => onDraftContextMenu?.(e, m.id, pi)
                : undefined
            }
          />
        ))}
      <div ref={bottomRef} />
    </div>
  );
}
