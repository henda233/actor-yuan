import type { LoadingStage } from '../hooks/useConversation';

interface ConfirmDraftBarProps {
  loading: boolean;
  loadingStage: LoadingStage;
  onConfirm: () => void;
  onDiscard: () => void;
  onRegenerate: () => void;
}

export default function ConfirmDraftBar({ loading, loadingStage, onConfirm, onDiscard, onRegenerate }: ConfirmDraftBarProps) {
  const loadingText = loadingStage === 'reasoning'
    ? 'AI 正在推演剧情思路...'
    : 'AI 正在输出游戏情节...';

  return (
    <div className="confirm-draft-bar">
      <span className="confirm-draft-hint">草稿待确认 —— 直接在文本框中编辑草稿内容</span>
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
          {loading ? loadingText : '重新生成'}
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
