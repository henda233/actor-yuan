interface TopBarProps {
  panelOpen: boolean;
  onTogglePanel: () => void;
}

export default function TopBar({ panelOpen, onTogglePanel }: TopBarProps) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">ActorYuan</h1>
      <button
        type="button"
        className="topbar-toggle"
        onClick={onTogglePanel}
        title={panelOpen ? '关闭侧边栏' : '打开侧边栏'}
      >
        <span className="topbar-toggle-icon">{panelOpen ? '✕' : '☰'}</span>
        <span className="topbar-toggle-text">{panelOpen ? '关闭面板' : '设置'}</span>
      </button>
    </header>
  );
}
