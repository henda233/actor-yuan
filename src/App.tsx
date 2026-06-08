import { useState, useEffect, useCallback } from 'react';
import { useDataStore } from './services/dataStore';
import { useExitWarning } from './hooks/useExitWarning';
import { useConversation } from './hooks/useConversation';
import { getProvider, getApiKey } from './services/configStorage';
import type { Message } from './types/storage';
import TopBar from './components/TopBar';
import WelcomeScreen from './components/WelcomeScreen';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import ConfirmDraftBar from './components/ConfirmDraftBar';
import DraftContextMenu from './components/DraftContextMenu';
import InsertDialog from './components/InsertDialog';
import RightPanel from './components/RightPanel';
import SettingsPanel from './components/SettingsPanel';
import ModulePanel from './components/ModulePanel';
import BillingCorner from './components/BillingCorner';
import './components/TopBar.css';
import './components/MessageBubble.css';
import './components/ChatInput.css';
import './components/ConfirmDraftBar.css';
import './components/DraftContextMenu.css';
import './components/InsertDialog.css';
import './components/RightPanel.css';
import './components/SettingsPanel.css';
import './components/ModulePanel.css';
import './components/BillingCorner.css';
import './components/WelcomeScreen.css';
import './App.css';

function isConfigured(): boolean {
  const p = getProvider();
  const key = getApiKey();
  return p !== 'mock' && key !== null && key !== '';
}

interface ContextMenuState {
  x: number;
  y: number;
  messageId: string;
  paragraphIndex: number;
}

function calcInsertPosition(content: string, paragraphIndex: number): number {
  const paragraphs = content.split('\n');
  let pos = 0;
  for (let i = 0; i <= paragraphIndex; i++) {
    pos += paragraphs[i].length;
    if (i < paragraphIndex) pos += 1;
  }
  return pos;
}

function App() {
  const { dirty } = useDataStore();
  useExitWarning(dirty);

  const conv = useConversation();
  const {
    phase,
    messages,
    loading,
    error,
    draftMessage,
    sendMessage,
    insertIntoDraft,
    discardDraft,
    regenerateDraft,
    confirmDraft,
  } = conv;

  const [panelOpen, setPanelOpen] = useState(false);
  const [configured, setConfigured] = useState(isConfigured);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [insertDialogOpen, setInsertDialogOpen] = useState(false);
  const [insertTarget, setInsertTarget] = useState<{ messageId: string; position: number } | null>(null);
  const [draftInserted, setDraftInserted] = useState(false);

  useEffect(() => {
    if (phase === 'chatting') {
      setDraftInserted(false);
    }
  }, [phase]);

  const handleTogglePanel = useCallback(() => {
    setPanelOpen((prev) => {
      if (prev) {
        setConfigured(isConfigured());
      }
      return !prev;
    });
  }, []);

  const handleStartConfig = useCallback(() => {
    setPanelOpen(true);
  }, []);

  const handleDraftContextMenu = useCallback(
    (e: React.MouseEvent, messageId: string, paragraphIndex: number) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, messageId, paragraphIndex });
    },
    [],
  );

  const handleInsertClick = useCallback(() => {
    if (!contextMenu || !draftMessage) return;
    const position = calcInsertPosition(draftMessage.content, contextMenu.paragraphIndex);
    setInsertTarget({ messageId: contextMenu.messageId, position });
    setInsertDialogOpen(true);
  }, [contextMenu, draftMessage]);

  const handleInsertConfirm = useCallback(
    (text: string) => {
      if (!insertTarget) return;
      insertIntoDraft(insertTarget.position, `【${text}】`);
      setDraftInserted(true);
      setInsertDialogOpen(false);
      setInsertTarget(null);
    },
    [insertTarget, insertIntoDraft],
  );

  const showWelcome = !configured && !panelOpen;

  const rightPanelTabs = [
    { key: 'settings', label: '设置', content: <SettingsPanel /> },
    { key: 'module', label: '模组', content: <ModulePanel /> },
  ];

  return (
    <div className="app-layout">
      <TopBar panelOpen={panelOpen} onTogglePanel={handleTogglePanel} />
      <div className="app-main">
        <div className="chat-area">
          {showWelcome ? (
            <WelcomeScreen onStartConfig={handleStartConfig} />
          ) : (
            <>
              <MessageList
                messages={messages}
                draftInserted={draftInserted}
                onDraftContextMenu={handleDraftContextMenu}
              />
              {error && <div className="chat-error">{error}</div>}
              {phase === 'chatting' ? (
                <ChatInput loading={loading} onSend={sendMessage} />
              ) : (
                <ConfirmDraftBar
                  loading={loading}
                  onConfirm={confirmDraft}
                  onDiscard={discardDraft}
                  onRegenerate={regenerateDraft}
                />
              )}
            </>
          )}
        </div>
        <aside className={panelOpen ? 'right-panel' : 'right-panel-hidden'}>
          <RightPanel tabs={rightPanelTabs} />
        </aside>
      </div>
      <BillingCorner />
      <DraftContextMenu
        x={contextMenu?.x ?? 0}
        y={contextMenu?.y ?? 0}
        visible={contextMenu !== null}
        disabled={draftInserted}
        onInsert={handleInsertClick}
        onClose={() => setContextMenu(null)}
      />
      <InsertDialog
        visible={insertDialogOpen}
        onConfirm={handleInsertConfirm}
        onCancel={() => {
          setInsertDialogOpen(false);
          setInsertTarget(null);
        }}
      />
    </div>
  );
}

export default App;
