import { useState } from 'react';

interface InsertDialogProps {
  visible: boolean;
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

export default function InsertDialog({ visible, onConfirm, onCancel }: InsertDialogProps) {
  const [text, setText] = useState('');

  if (!visible) return null;

  const handleConfirm = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setText('');
  };

  const handleCancel = () => {
    setText('');
    onCancel();
  };

  return (
    <div className="insert-dialog-overlay" onClick={handleCancel}>
      <div className="insert-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="insert-dialog-title">插入判定结果</h3>
        <textarea
          className="insert-dialog-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入判定结果，将以【】包裹插入到段尾..."
          rows={5}
          autoFocus
        />
        <div className="insert-dialog-actions">
          <button type="button" className="btn btn-discard" onClick={handleCancel}>
            取消
          </button>
          <button
            type="button"
            className="btn btn-confirm"
            onClick={handleConfirm}
            disabled={!text.trim()}
          >
            确认插入
          </button>
        </div>
      </div>
    </div>
  );
}
