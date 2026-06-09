import { useState, useEffect } from 'react';
import type { Message } from '../types/storage';
import type { Phase, LoadingStage } from '../hooks/useConversation';

interface MessageBubbleProps {
  message: Message;
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

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MessageBubble({
  message,
  phase,
  loading,
  loadingStage,
  onRegenerate,
  onDiscard,
  onStartEdit,
  onConfirm,
  onSaveEdit,
  onCancelEdit,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isDraft = message.status === 'draft';
  const isEditing = isDraft && phase === 'editing_draft';
  const isReviewing = isDraft && phase === 'reviewing_draft';
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  useEffect(() => {
    if (isEditing) {
      setEditContent(message.content);
    }
  }, [isEditing, message.content]);

  const bubbleClass = [
    'msg-bubble',
    isUser ? 'msg-user' : 'msg-ai',
    isDraft ? 'msg-draft' : '',
  ].filter(Boolean).join(' ');

  const loadingText = loadingStage === 'reasoning'
    ? 'AI 正在推演剧情思路...'
    : 'AI 正在输出游戏情节...';

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

      {isEditing ? (
        <>
          <textarea
            className="msg-draft-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={6}
          />
          <div className="msg-draft-actions">
            <button
              type="button"
              className="btn btn-discard"
              onClick={onCancelEdit}
              disabled={loading}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-confirm"
              onClick={() => onSaveEdit(editContent)}
              disabled={loading}
            >
              {loading ? loadingText : '保存'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="msg-content">
            {message.content.split('\n').map((p, i) => (
              <p key={i} className="msg-paragraph">
                {p || ' '}
              </p>
            ))}
          </div>
          {isReviewing && (
            <div className="msg-draft-actions">
              <button
                type="button"
                className="btn btn-regenerate"
                onClick={onRegenerate}
                disabled={loading}
              >
                {loading ? loadingText : '重新生成(仅情节)'}
              </button>
              <button
                type="button"
                className="btn btn-discard"
                onClick={onDiscard}
                disabled={loading}
              >
                放弃草稿
              </button>
              <button
                type="button"
                className="btn"
                onClick={onStartEdit}
                disabled={loading}
              >
                编辑草稿
              </button>
              <button
                type="button"
                className="btn btn-confirm"
                onClick={onConfirm}
                disabled={loading}
              >
                确认草稿
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
