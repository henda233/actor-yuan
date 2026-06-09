export interface DialogButton {
  label: string;
  value: string;
  primary?: boolean;
}

interface DialogProps {
  open: boolean;
  title: string;
  message: string;
  buttons: DialogButton[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function Dialog({ open, title, message, buttons, onSelect, onClose }: DialogProps) {
  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          {buttons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              className={`btn ${btn.primary ? 'btn-confirm' : 'btn-discard'}`}
              onClick={() => onSelect(btn.value)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
