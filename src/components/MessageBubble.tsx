import type { Message } from '../types/storage';

interface MessageBubbleProps {
  message: Message;
  draftInserted?: boolean;
  onParagraphContextMenu?: (e: React.MouseEvent, paragraphIndex: number) => void;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MessageBubble({ message, draftInserted, onParagraphContextMenu }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isDraft = message.status === 'draft';
  const paragraphs = message.content.split('\n');

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
      <div className="msg-content">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="msg-paragraph"
            onContextMenu={
              isDraft && onParagraphContextMenu && !draftInserted
                ? (e) => onParagraphContextMenu(e, i)
                : undefined
            }
          >
            {p || ' '}
          </p>
        ))}
      </div>
    </div>
  );
}
