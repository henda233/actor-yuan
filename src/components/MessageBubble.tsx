import { useState } from 'react';
import type { Message } from '../types/storage';

interface MessageBubbleProps {
  message: Message;
  onDraftContentChange?: (content: string) => void;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MessageBubble({ message, onDraftContentChange }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isDraft = message.status === 'draft';
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const bubbleClass = [
    'msg-bubble',
    isUser ? 'msg-user' : 'msg-ai',
    isDraft ? 'msg-draft' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={bubbleClass}>
      <div className="msg-header">
        <span className="msg-role">{isUser ? '我' : 'AI 主持人'}</span>
        <span className="msg-time">{formatTime(message.timestamp)}</span>
        {isDraft && <span className="msg-draft-badge">草稿</span>}
      </div>

      {isDraft && message.reasoning && (
        <details
          className="msg-reasoning"
          open={reasoningOpen}
          onToggle={(e) => setReasoningOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="msg-reasoning-summary">推演思路</summary>
          <div className="msg-reasoning-content">{message.reasoning}</div>
        </details>
      )}

      {isDraft ? (
        <textarea
          className="msg-draft-textarea"
          value={message.content}
          onChange={(e) => onDraftContentChange?.(e.target.value)}
          rows={6}
        />
      ) : (
        <div className="msg-content">
          {message.content.split('\n').map((p, i) => (
            <p key={i} className="msg-paragraph">
              {p || ' '}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
