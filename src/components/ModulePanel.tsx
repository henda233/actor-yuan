import { useState, useRef, useCallback } from 'react';
import { useDataStore } from '../services/dataStore';
import Dialog from './Dialog';

export default function ModulePanel() {
  const { data, setModule } = useDataStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filename, setFilename] = useState<string | null>(null);
  const [importTime, setImportTime] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    buttons: { label: string; value: string; primary?: boolean }[];
    pendingContent?: string;
    pendingFilename?: string;
  } | null>(null);

  const moduleContent = data.module ?? '';

  const lines = moduleContent ? moduleContent.split(/\r?\n/).length : 0;
  const chars = moduleContent.length;

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setModule(e.target.value);
    },
    [setModule],
  );

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const name = file.name;
      const now = new Date().toLocaleString();

      if (moduleContent.trim()) {
        setDialogConfig({
          title: '导入模组',
          message: `已读取文件 "${name}"（${content.length} 字符）。如何处理当前内容？`,
          buttons: [
            { label: '替换', value: 'replace', primary: true },
            { label: '追加', value: 'append' },
            { label: '取消', value: 'cancel' },
          ],
          pendingContent: content,
          pendingFilename: name,
        });
        setDialogOpen(true);
      } else {
        setModule(content);
        setFilename(name);
        setImportTime(now);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearClick = () => {
    if (!moduleContent.trim()) return;
    setDialogConfig({
      title: '清空模组',
      message: '确定清空当前模组内容？此操作不可撤销。',
      buttons: [
        { label: '确定', value: 'confirm', primary: true },
        { label: '取消', value: 'cancel' },
      ],
    });
    setDialogOpen(true);
  };

  const handleDialogSelect = (value: string) => {
    setDialogOpen(false);
    if (!dialogConfig) return;

    if (value === 'cancel') {
      setDialogConfig(null);
      return;
    }

    if (value === 'confirm') {
      setModule('');
      setFilename(null);
      setImportTime(null);
      setDialogConfig(null);
      return;
    }

    if (value === 'replace' && dialogConfig.pendingContent != null) {
      setModule(dialogConfig.pendingContent);
      setFilename(dialogConfig.pendingFilename ?? null);
      setImportTime(new Date().toLocaleString());
    }

    if (value === 'append' && dialogConfig.pendingContent != null) {
      const appended = moduleContent + '\n\n---\n\n' + dialogConfig.pendingContent;
      setModule(appended);
      setFilename((prev) => (prev ? `${prev}, ${dialogConfig.pendingFilename}` : (dialogConfig.pendingFilename ?? null)));
      setImportTime(new Date().toLocaleString());
    }

    setDialogConfig(null);
  };

  return (
    <div className="module-panel">
      <div className="module-toolbar">
        <button type="button" className="btn btn-regenerate" onClick={handleImportClick}>
          导入文件
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="btn btn-discard"
          onClick={handleClearClick}
          disabled={!moduleContent.trim()}
        >
          清空
        </button>
      </div>

      <textarea
        className="setting-textarea module-textarea"
        value={moduleContent}
        onChange={handleTextChange}
        placeholder="在此粘贴或导入模组内容（Markdown / 纯文本）..."
        rows={12}
      />

      <div className="module-meta">
        <span>来源：{filename ?? '—'}</span>
        {importTime && <span>导入时间：{importTime}</span>}
        <span>行数：{lines}</span>
        <span>字符数：{chars}</span>
      </div>

      {dialogConfig && (
        <Dialog
          open={dialogOpen}
          title={dialogConfig.title}
          message={dialogConfig.message}
          buttons={dialogConfig.buttons}
          onSelect={handleDialogSelect}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
}
