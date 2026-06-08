import { useRef } from 'react';
import { useDataStore } from './services/dataStore';
import { useExitWarning } from './hooks/useExitWarning';

function App() {
  const { dirty, exportData, importData } = useDataStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useExitWarning(dirty);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
    } catch (err) {
      alert(err instanceof Error ? err.message : '导入失败');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px' }}>
      <h1>ActorYuan - AI 跑团主持人</h1>
      <p style={{ color: '#666' }}>纯前端 AI TRPG 主持人交互应用</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button type="button" onClick={exportData}>
          导出数据
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          导入数据
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>
      {dirty && (
        <p style={{ color: '#e67e22', marginTop: 16, fontSize: 14 }}>
          存在未导出的数据，关闭或刷新页面将丢失。
        </p>
      )}
    </div>
  );
}

export default App;
