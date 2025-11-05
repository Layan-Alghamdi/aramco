import { create } from 'zustand';

export type SavingState = 'idle' | 'saving' | 'saved' | 'offline';

type EditorState = {
  presentationId: string | null;
  currentSlideId: string | null;
  saving: SavingState;
  setSaving: (s: SavingState) => void;
  setContext: (pId: string, sId: string) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  presentationId: null,
  currentSlideId: null,
  saving: 'idle',
  setSaving: (s) => set({ saving: s }),
  setContext: (pId, sId) => set({ presentationId: pId, currentSlideId: sId })
}));

