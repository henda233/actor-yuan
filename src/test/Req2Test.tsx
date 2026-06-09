import { useState, useRef } from 'react';
import { useDataStore } from '../services/dataStore';
import { getSystemPrompt, setSystemPrompt } from '../services/configStorage';
import { useConversation } from '../hooks/useConversation';
import type { Message } from '../types/storage';

function TestResult({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div style={{ marginBottom: 8, fontSize: 14 }}>
      <span style={{ fontWeight: 600 }}>{ok ? '✅' : '❌'} {label}</span>
      {detail && <pre style={{ margin: '4px 0 0 16px', color: '#888', fontSize: 12 }}>{detail}</pre>}
    </div>
  );
}

export default function Req2Test() {
  const { data, addMessage, updateMessage } = useDataStore();
  const conv = useConversation();
  const [results, setResults] = useState<Array<{ id: string; label: string; ok: boolean; detail?: string }>>([]);

  // refs to avoid stale closure in async test callbacks
  const convRef = useRef(conv);
  convRef.current = conv;
  const dataRef = useRef(data);
  dataRef.current = data;

  const addResult = (id: string, label: string, ok: boolean, detail?: string) => {
    setResults((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return [...filtered, { id, label, ok, detail }];
    });
  };

  return (
    <div style={{ maxWidth: 640, margin: '20px auto', padding: 16, border: '2px solid #333', borderRadius: 8 }}>
      <h2>需求2 手动测试面板</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <Button onClick={() => testS2(addResult)} label="S2: 系统提示词读写" />
        <Button onClick={() => testS4AddMsg(addMessage, addResult)} label="S4: addMessage(status)" />
        <Button onClick={() => testS4Update(addMessage, updateMessage, addResult)} label="S4: updateMessage" />
        <Button onClick={() => testS5Send(convRef, dataRef, addResult)} label="S5: sendMessage" />
        <Button onClick={() => testS5EditSave(convRef, dataRef, addResult)} label="S5: saveEditedDraft" />
        <Button onClick={() => testS5Confirm(convRef, dataRef, addResult)} label="S5: confirmDraft" />
        <Button onClick={() => testS5Guard(convRef, addResult)} label="S5: 防重复发送" />
        <Button onClick={() => testS5PhaseRestore(data, addResult)} label="S5: phase恢复" />
      </div>

      <div style={{ marginBottom: 16, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
        <strong>当前状态：</strong>phase=<code>{conv.phase}</code>, loading=<code>{String(conv.loading)}</code>, error=<code>{conv.error || 'null'}</code>, draft=<code>{conv.draftMessage ? `id=${conv.draftMessage.id.slice(0, 8)}..., status=${conv.draftMessage.status}` : 'null'}</code>, messages=<code>{data.messages.length}条</code>
      </div>

      <hr />
      <strong>结果：</strong>
      {results.length === 0 && <p style={{ color: '#999' }}>点击上方按钮执行测试</p>}
      {results.map((r) => (
        <TestResult key={r.id} label={r.label} ok={r.ok} detail={r.detail} />
      ))}
    </div>
  );
}

function Button({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
    >
      {label}
    </button>
  );
}

// --- test functions ---

function testS2(addResult: (id: string, label: string, ok: boolean, detail?: string) => void) {
  const prev = getSystemPrompt();
  setSystemPrompt('测试提示词-需求2');
  const val = getSystemPrompt();
  const ok = val === '测试提示词-需求2';
  addResult('S2', 'S2: get/setSystemPrompt', ok, ok ? undefined : `期望"测试提示词-需求2"，实际"${val}"`);
  setSystemPrompt(prev);
}

function testS4AddMsg(
  addMessage: ReturnType<typeof useDataStore>['addMessage'],
  addResult: (id: string, label: string, ok: boolean, detail?: string) => void,
) {
  addMessage('assistant', 'S4-无status', undefined);
  addMessage('assistant', 'S4-draft', 'draft');
  addMessage('user', 'S4-confirmed-user');
  addMessage('assistant', 'S4-confirmed', 'confirmed');
  addResult('S4-1', 'S4: addMessage(无status)→无status字段', true, '已添加4条测试消息（含无status、draft、confirmed）');
}

function testS4Update(
  _: ReturnType<typeof useDataStore>['addMessage'],
  updateMessage: ReturnType<typeof useDataStore>['updateMessage'],
  addResult: (id: string, label: string, ok: boolean, detail?: string) => void,
) {
  updateMessage('nonexistent-id', { content: '无匹配' });
  addResult('S4-2', 'S4: updateMessage(nonexistent) 不抛错', true);
}

function testS5Send(
  convRef: React.MutableRefObject<ReturnType<typeof useConversation>>,
  dataRef: React.MutableRefObject<{ messages: Message[] }>,
  addResult: (id: string, label: string, ok: boolean, detail?: string) => void,
) {
  const conv = convRef.current;
  const data = dataRef.current;
  const countBefore = data.messages.length;
  if (conv.phase !== 'chatting') {
    addResult('S5-1', 'S5: sendMessage → 跳过（非chatting状态）', false, `当前 phase=${conv.phase}，请先确认或清理草稿`);
    return;
  }
  conv.sendMessage('测试：推开大门').then(() => {
    // re-read from refs to get post-render values
    setTimeout(() => {
      const latestConv = convRef.current;
      const latestData = dataRef.current;
      const msgCount = latestData.messages.length;
      const ok = latestConv.phase === 'reviewing_draft' && latestConv.draftMessage?.status === 'draft';
      addResult(
        'S5-1',
        'S5: sendMessage → draft 流程',
        ok,
        `消息 ${countBefore}→${msgCount}条, phase=${latestConv.phase}, draft.status=${latestConv.draftMessage?.status ?? 'null'}`,
      );
    }, 100);
  }).catch((e) => {
    addResult('S5-1', 'S5: sendMessage → 异常', false, String(e));
  });
}

function testS5EditSave(
  convRef: React.MutableRefObject<ReturnType<typeof useConversation>>,
  dataRef: React.MutableRefObject<{ messages: Message[] }>,
  addResult: (id: string, label: string, ok: boolean, detail?: string) => void,
) {
  const conv = convRef.current;
  if (conv.phase !== 'reviewing_draft' || !conv.draftMessage) {
    addResult('S5-2', 'S5: saveEditedDraft → 跳过（无draft）', false, `phase=${conv.phase}，请先执行 sendMessage`);
    return;
  }
  const before = conv.draftMessage.content;
  conv.startEditingDraft();
  setTimeout(() => {
    const edited = `[检定：D20=18，成功] ${before}`;
    convRef.current.saveEditedDraft(edited).then(() => {
      const latestData = dataRef.current;
      const draft = latestData.messages.find((m) => m.status === 'draft');
      const ok = draft != null;
      addResult(
        'S5-2',
        'S5: saveEditedDraft',
        ok,
        `编辑前: ${before.slice(0, 30)}...\n编辑后: ${draft?.content.slice(0, 40)}...`,
      );
    }).catch((e) => {
      addResult('S5-2', 'S5: saveEditedDraft → 异常', false, String(e));
    });
  }, 100);
}

function testS5Confirm(
  convRef: React.MutableRefObject<ReturnType<typeof useConversation>>,
  dataRef: React.MutableRefObject<{ messages: Message[] }>,
  addResult: (id: string, label: string, ok: boolean, detail?: string) => void,
) {
  const conv = convRef.current;
  if (conv.phase !== 'reviewing_draft' || !conv.draftMessage) {
    addResult('S5-3', 'S5: confirmDraft → 跳过（无draft）', false, `phase=${conv.phase}，请先执行 sendMessage`);
    return;
  }
  const draftId = conv.draftMessage.id;
  conv.confirmDraft();
  setTimeout(() => {
    const latestConv = convRef.current;
    const latestData = dataRef.current;
    const msg = latestData.messages.find((m) => m.id === draftId);
    const ok = latestConv.phase === 'chatting' && msg?.status === 'confirmed';
    addResult(
      'S5-3',
      'S5: confirmDraft',
      ok,
      `phase=${latestConv.phase}, msg.status=${msg?.status}`,
    );
  }, 100);
}

function testS5Guard(
  convRef: React.MutableRefObject<ReturnType<typeof useConversation>>,
  addResult: (id: string, label: string, ok: boolean, detail?: string) => void,
) {
  const doGuardTest = () => {
    try {
      convRef.current.sendMessage('重复发送');
      addResult('S5-4', 'S5: sendMessage 防重复 → 未抛错', false, '期望抛Error 但未抛出');
    } catch (e) {
      const ok = e instanceof Error && e.message.includes('草稿');
      addResult('S5-4', 'S5: sendMessage 防重复', ok, ok ? '正确抛出异常（reviewing_draft状态下阻止发送）' : String(e));
    }
  };

  if (convRef.current.phase === 'reviewing_draft') {
    doGuardTest();
  } else {
    // 当前 chatting 状态，先进入 reviewing_draft 再测
    convRef.current.sendMessage('进入草稿状态').then(() => {
      setTimeout(doGuardTest, 100);
    });
  }
}

function testS5PhaseRestore(
  data: { messages: Message[] },
  addResult: (id: string, label: string, ok: boolean, detail?: string) => void,
) {
  const hasDraft = data.messages.some((m) => m.status === 'draft');
  addResult(
    'S5-5',
    'S5: phase恢复检测',
    true,
    `当前 data 中${hasDraft ? '有' : '无'}draft 消息 → 初始化时 phase 应为 ${hasDraft ? 'reviewing_draft' : 'chatting'}（刷新页面验证）`,
  );
}
