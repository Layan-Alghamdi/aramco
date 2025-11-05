import React from 'react';

type EditorState = {
  scene: unknown;
  isDirty: boolean;
  setScene: (s: unknown) => void;
  markDirty: () => void;
};

const EditorStoreContext = React.createContext<EditorState | null>(null);

export function EditorStoreProvider(props: { children: React.ReactNode }): JSX.Element {
  const [scene, setScene] = React.useState<unknown>({ boxes: [] });
  const [isDirty, setDirty] = React.useState<boolean>(false);

  const value = React.useMemo<EditorState>(() => ({
    scene,
    isDirty,
    setScene: (s: unknown) => {
      setScene(s);
    },
    markDirty: () => setDirty(true)
  }), [scene, isDirty]);

  return <EditorStoreContext.Provider value={value}>{props.children}</EditorStoreContext.Provider>;
}

export function useEditorStore(): EditorState {
  const ctx = React.useContext(EditorStoreContext);
  if (!ctx) throw new Error('EditorStoreProvider missing');
  return ctx;
}


