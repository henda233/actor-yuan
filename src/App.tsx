import { useState, useCallback } from 'react';
import { useDataStore } from './services/dataStore';
import { useExitWarning } from './hooks/useExitWarning';
import { useConversation } from './hooks/useConversation';
import { getProvider, getApiKey, getApiBaseUrl, getModel, getDebugMode } from './services/configStorage';
import { createAIService } from './services/aiService';
import TopBar from './components/TopBar';
import WelcomeScreen from './components/WelcomeScreen';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import RightPanel from './components/RightPanel';
import SettingsPanel from './components/SettingsPanel';
import ModulePanel from './components/ModulePanel';
import BillingCorner from './components/BillingCorner';
import DebugPanel from './components/DebugPanel';
import './components/TopBar.css';
import './components/MessageBubble.css';
import './components/ChatInput.css';
import './components/RightPanel.css';
import './components/SettingsPanel.css';
import './components/ModulePanel.css';
import './components/BillingCorner.css';
import './components/WelcomeScreen.css';
import './components/DebugPanel.css';
import './components/Dialog.css';
import './App.css';

function isConfigured(): boolean {
  const p = getProvider();
  const key = getApiKey();
  return p !== 'mock' && key !== null && key !== '';
}

function App() {
  const { dirty } = useDataStore();
  useExitWarning(dirty);

  const aiService = createAIService({
    provider: getProvider(),
    apiKey: getApiKey() ?? '',
    apiBaseUrl: getApiBaseUrl(),
    model: getModel() ?? '',
  });

  const conv = useConversation(aiService);
  const {
    phase,
    messages,
    loading,
    loadingStage,
    error,
    pendingReasoning,
    debugEntries,
    sendMessage,
    retryNarrative,
    cancelPendingReasoning,
    discardDraft,
    regenerateDraft,
    confirmDraft,
    startEditingDraft,
    cancelEditingDraft,
    saveEditedDraft,
  } = conv;

  const [panelOpen, setPanelOpen] = useState(false);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  const [configured, setConfigured] = useState(isConfigured);
  const [debugMode, setDebugModeState] = useState(getDebugMode);

  const handleTogglePanel = useCallback(() => {
    setPanelOpen((prev) => {
      if (prev) {
        setConfigured(isConfigured());
        setDebugModeState(getDebugMode());
      }
      return !prev;
    });
  }, []);

  const handleStartConfig = useCallback(() => {
    setPanelOpen(true);
  }, []);

  const showWelcome = !configured && !panelOpen;

  const rightPanelTabs = [
    { key: 'settings', label: '设置', content: <SettingsPanel /> },
    { key: 'module', label: '模组', content: <ModulePanel /> },
  ];

  return (
    <div className="app-layout">
      <TopBar
        panelOpen={panelOpen}
        onTogglePanel={handleTogglePanel}
        debugMode={debugMode}
        debugPanelOpen={debugPanelOpen}
        onToggleDebugPanel={() => setDebugPanelOpen(prev => !prev)}
      />
      <div className="app-main">
        <div className="chat-area">
          {showWelcome ? (
            <WelcomeScreen onStartConfig={handleStartConfig} />
          ) : (
            <>
              <MessageList
                messages={messages}
                phase={phase}
                loading={loading}
                loadingStage={loadingStage}
                onRegenerate={regenerateDraft}
                onDiscard={discardDraft}
                onStartEdit={startEditingDraft}
                onConfirm={confirmDraft}
                onSaveEdit={saveEditedDraft}
                onCancelEdit={cancelEditingDraft}
              />
              {error && <div className="chat-error">{error}</div>}
              {phase === 'chatting' && (
                <ChatInput
                  loading={loading}
                  loadingStage={loadingStage}
                  pendingReasoning={pendingReasoning !== null}
                  onSend={sendMessage}
                  onRetryNarrative={retryNarrative}
                  onCancelPending={cancelPendingReasoning}
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
      <DebugPanel
        open={debugPanelOpen}
        debugEntries={debugEntries}
        onClose={() => setDebugPanelOpen(false)}
      />
    </div>
  );
}

export default App;
