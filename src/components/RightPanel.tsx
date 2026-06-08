import { useState, type ReactNode } from 'react';

interface Tab {
  key: string;
  label: string;
  content: ReactNode;
}

interface RightPanelProps {
  tabs: Tab[];
}

export default function RightPanel({ tabs }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? '');

  return (
    <div className="right-panel-inner">
      <div className="panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`panel-tab ${activeTab === tab.key ? 'panel-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="panel-content">
        {tabs.find((t) => t.key === activeTab)?.content}
      </div>
    </div>
  );
}
