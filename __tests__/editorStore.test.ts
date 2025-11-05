import { act } from '@testing-library/react';
import { useEditorStore } from '@/lib/store/editorStore';

describe('Editor store', () => {
  it('updates saving state', () => {
    const get = useEditorStore.getState();
    act(() => {
      get.setSaving('saving');
    });
    expect(useEditorStore.getState().saving).toBe('saving');
  });
});

