import { useState } from 'react';
import type { DebugEntries, DebugEntry } from '../hooks/useConversation';

interface DebugPanelProps {
  open: boolean;
  debugEntries: DebugEntries;
  onClose: () => void;
}

function EntrySection({ entry, label }: { entry?: DebugEntry; label: string }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());

  if (!entry) {
    return (
      <div className="debug-section">
        <h3 className="debug-section-title">{label}</h3>
        <p className="debug-empty">暂无数据</p>
      </div>
    );
  }

  const toggleMessage = (idx: number) => {
    setExpandedMessages(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="debug-section">
      <h3 className="debug-section-title">
        {label}
        <span className="debug-timestamp">
          {new Date(entry.timestamp).toLocaleTimeString()}
        </span>
      </h3>

      <div className="debug-subsection">
        <button
          type="button"
          className="debug-toggle"
          onClick={() => setShowPrompt(prev => !prev)}
        >
          {showPrompt ? '▾' : '▸'} 系统提示词
        </button>
        {showPrompt && (
          <pre className="debug-code">{entry.systemPrompt}</pre>
        )}
      </div>

      <div className="debug-subsection">
        <span className="debug-toggle debug-toggle-static">
          消息列表 ({entry.messages.length})
        </span>
        <div className="debug-messages">
          {entry.messages.map((msg, idx) => (
            <div key={msg.id || idx} className="debug-msg">
              <button
                type="button"
                className="debug-msg-header"
                onClick={() => toggleMessage(idx)}
              >
                <span>{expandedMessages.has(idx) ? '▾' : '▸'}</span>
                <span className={`debug-role debug-role-${msg.role}`}>{msg.role}</span>
                <span className="debug-msg-preview">
                  {msg.content.slice(0, 80)}{msg.content.length > 80 ? '...' : ''}
                </span>
              </button>
              {expandedMessages.has(idx) && (
                <pre className="debug-msg-content">{msg.content}</pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DebugPanel({ open, debugEntries, onClose }: DebugPanelProps) {
  if (!open) return null;

  return (
    <div className="debug-overlay" onClick={onClose}>
      <div className="debug-panel" onClick={e => e.stopPropagation()}>
        <div className="debug-header">
          <h2 className="debug-title">Debug: AI 输入</h2>
          <button type="button" className="debug-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="debug-body">
          <EntrySection entry={debugEntries.reasoning} label="阶段一：推演方案制定" />
          <div className="debug-divider" />
          <EntrySection entry={debugEntries.narrative} label="阶段二：游戏情节推演" />
        </div>
      </div>
    </div>
  );
}
