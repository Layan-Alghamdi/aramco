import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { AutosaveIndicator } from '../../components/AutosaveIndicator';
import { Canvas } from '../../components/Canvas';
import { useEditorStore } from '../../state/editorStore';
import { useAutosave } from '../../lib/autosave';

export default function EditorPage(): JSX.Element {
  const router = useRouter();
  const deckId = (router.query.deckId as string) || 'demo-deck';
  const { scene, setScene, markDirty } = useEditorStore();
  const { status } = useAutosave(`${deckId}-slide-0`, scene, 800);

  const onChange = (next: unknown) => {
    setScene(next);
    markDirty();
  };

  const title = useMemo(() => `Editor — ${deckId}`, [deckId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #eee' }}>
        <h3 style={{ margin: 0, marginRight: 12 }}>{title}</h3>
        <AutosaveIndicator state={status} />
      </header>
      <main style={{ flex: 1, display: 'flex' }}>
        <Canvas scene={scene} onChange={onChange} />
      </main>
    </div>
  );
}


