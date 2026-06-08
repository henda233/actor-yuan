interface TopBarProps {
  panelOpen: boolean;
  onTogglePanel: () => void;
  debugMode: boolean;
  debugPanelOpen: boolean;
  onToggleDebugPanel: () => void;
}

export default function TopBar({
  panelOpen,
  onTogglePanel,
  debugMode,
  debugPanelOpen,
  onToggleDebugPanel,
}: TopBarProps) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">ActorYuan</h1>
      <div className="topbar-actions">
        {debugMode && (
          <button
            type="button"
            className={`topbar-toggle topbar-debug-btn ${debugPanelOpen ? 'topbar-debug-active' : ''}`}
            onClick={onToggleDebugPanel}
            title={debugPanelOpen ? '关闭 Debug 面板' : '打开 Debug 面板'}
          >
            <span className="topbar-toggle-text">
              {debugPanelOpen ? '关闭 Debug' : 'Debug'}
            </span>
          </button>
        )}
        <button
          type="button"
          className="topbar-toggle"
          onClick={onTogglePanel}
          title={panelOpen ? '关闭侧边栏' : '打开侧边栏'}
        >
          <span className="topbar-toggle-icon">{panelOpen ? '✕' : '☰'}</span>
          <span className="topbar-toggle-text">{panelOpen ? '关闭面板' : '设置'}</span>
        </button>
      </div>
    </header>
  );
}
