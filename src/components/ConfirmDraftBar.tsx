interface ConfirmDraftBarProps {
  loading: boolean;
  onConfirm: () => void;
  onDiscard: () => void;
  onRegenerate: () => void;
}

export default function ConfirmDraftBar({ loading, onConfirm, onDiscard, onRegenerate }: ConfirmDraftBarProps) {
  return (
    <div className="confirm-draft-bar">
      <span className="confirm-draft-hint">草稿待确认 —— 右键草稿文本可插入判定结果</span>
      <div className="confirm-draft-actions">
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
          className="btn btn-regenerate"
          onClick={onRegenerate}
          disabled={loading}
        >
          {loading ? '生成中...' : '重新生成'}
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
    </div>
  );
}
