import React from 'react';

type CanvasProps = {
  scene: unknown;
  onChange: (next: unknown) => void;
};

export function Canvas({ scene, onChange }: CanvasProps): JSX.Element {
  // placeholder canvas: click adds a rectangle-like object
  const addBox = () => {
    const next = {
      ...(scene as Record<string, unknown>),
      boxes: [
        ...(((scene as any)?.boxes as any[]) || []),
        { id: String(Date.now()), x: 40, y: 40, w: 160, h: 90 }
      ]
    };
    onChange(next);
  };

  const boxes = ((scene as any)?.boxes as any[]) || [];

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <aside style={{ width: 240, borderRight: '1px solid #eee', padding: 12 }}>
        <button onClick={addBox}>Add Box</button>
      </aside>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 960, height: 540, background: 'white', border: '1px solid #ddd', position: 'relative' }}>
          {boxes.map((b) => (
            <div
              key={b.id}
              style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, background: '#E6F0FF', border: '1px solid #7DA7F7' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


