import { useState, useEffect } from 'react';
import { useDataStore } from '../services/dataStore';

interface DataEditorPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function DataEditorPanel({ open, onClose }: DataEditorPanelProps) {
  const { data, setModule, setContextHistory, updateMessage } = useDataStore();
  const [moduleText, setModuleText] = useState(data.module);
  const [contextHistoryText, setContextHistoryText] = useState(data.contextHistory);
  const [messageContents, setMessageContents] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setModuleText(data.module);
      setContextHistoryText(data.contextHistory);
      const contents: Record<string, string> = {};
      for (const m of data.messages) {
        if (m.role !== 'system') {
          contents[m.id] = m.content;
        }
      }
      setMessageContents(contents);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleMessages = data.messages
    .filter((m) => m.role !== 'system')
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp);

  if (!open) return null;

  return (
    <div className="data-editor-overlay" onClick={onClose}>
      <div className="data-editor-panel" onClick={(e) => e.stopPropagation()}>
        <div className="data-editor-header">
          <h2 className="data-editor-title">数据编辑</h2>
          <button type="button" className="data-editor-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="data-editor-body">
          {/* Module */}
          <section className="data-editor-section">
            <h3 className="data-editor-section-title">模组</h3>
            <textarea
              className="data-editor-textarea"
              value={moduleText}
              onChange={(e) => {
                setModuleText(e.target.value);
                setModule(e.target.value);
              }}
              rows={4}
              placeholder="暂无模组内容"
            />
          </section>

          {/* contextHistory */}
          <section className="data-editor-section">
            <h3 className="data-editor-section-title">上下文历史</h3>
            <textarea
              className="data-editor-textarea"
              value={contextHistoryText}
              onChange={(e) => {
                setContextHistoryText(e.target.value);
                setContextHistory(e.target.value);
              }}
              rows={8}
              placeholder="暂无上下文历史"
            />
          </section>

          {/* Messages */}
          <section className="data-editor-section">
            <h3 className="data-editor-section-title">
              消息
              <span className="data-editor-count">{visibleMessages.length} 条</span>
            </h3>
            {visibleMessages.length === 0 ? (
              <p className="data-editor-empty">暂无消息</p>
            ) : (
              <div className="data-editor-entries">
                {visibleMessages.map((msg) => (
                  <div key={msg.id} className="data-editor-entry">
                    <div className="data-editor-entry-header">
                      <span className={`data-editor-role data-editor-role-${msg.role}`}>
                        {msg.role === 'user' ? '玩家' : 'AI 主持人'}
                      </span>
                      <span className="data-editor-time">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                      {msg.status === 'draft' && (
                        <span className="data-editor-draft-badge">草稿</span>
                      )}
                    </div>
                    <textarea
                      className="data-editor-textarea"
                      value={messageContents[msg.id] ?? msg.content}
                      onChange={(e) => {
                        setMessageContents((prev) => ({ ...prev, [msg.id]: e.target.value }));
                        updateMessage(msg.id, { content: e.target.value });
                      }}
                      rows={4}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
