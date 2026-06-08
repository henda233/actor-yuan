import { useEffect, useRef } from 'react';

interface DraftContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  disabled: boolean;
  onInsert: () => void;
  onClose: () => void;
}

export default function DraftContextMenu({ x, y, visible, disabled, onInsert, onClose }: DraftContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="draft-context-menu"
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        className="draft-context-menu-item"
        onClick={() => { onInsert(); onClose(); }}
        disabled={disabled}
      >
        插入判定结果
      </button>
    </div>
  );
}
