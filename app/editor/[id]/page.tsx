"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from '@/lib/store/editorStore';
import Link from 'next/link';
import Image from 'next/image';

async function fetchPresentation(id: string) {
  const res = await fetch(`/api/presentations/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export default function EditorPage({ params }: { params: { id: string } }) {
  const { setSaving, saving, setContext } = useEditorStore();
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [loading, setLoading] = useState(true);
  const [presentation, setPresentation] = useState<any | null>(null);
  const slide = presentation?.slides?.[0];

  // Initialize Fabric canvas
  useEffect(() => {
    const canvas = new fabric.Canvas('fabric-canvas', {
      backgroundColor: '#ffffff', selection: true, preserveObjectStacking: true
    });
    canvasRef.current = canvas;
    const resize = () => {
      const wrapper = document.getElementById('canvas-wrapper');
      if (!wrapper) return;
      const w = wrapper.clientWidth;
      const h = (w * 9) / 16;
      canvas.setWidth(w);
      canvas.setHeight(h);
      canvas.renderAll();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      canvas.dispose();
    };
  }, []);

  // Load presentation
  useEffect(() => {
    setLoading(true);
    fetchPresentation(params.id)
      .then((p) => {
        setPresentation(p);
        setContext(p.id, p.slides[0]?.id);
      })
      .finally(() => setLoading(false));
  }, [params.id, setContext]);

  // Render elements into Fabric on slide change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !slide) return;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.requestRenderAll();
    for (const el of slide.elements || []) {
      if (el.type === 'TEXT') {
        const t = new fabric.Textbox(el.json.text || 'Text', {
          left: el.json.left || 100,
          top: el.json.top || 100,
          fontSize: el.json.fontSize || 24,
          fill: el.json.fill || '#0A1F1A'
        });
        canvas.add(t);
      }
      // Shapes/images/icons can be added similarly (MVP keeps text)
    }
    canvas.renderAll();
  }, [slide]);

  // Autosave: every 3s gather elements
  useEffect(() => {
    if (!slide?.id) return;
    const interval = setInterval(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setSaving('saving');
      try {
        const elements = canvas.getObjects().map((o) => {
          if (o.type === 'textbox') {
            const tb = o as fabric.Textbox;
            return { type: 'TEXT', locked: false, json: {
              text: tb.text, left: tb.left, top: tb.top, fontSize: tb.fontSize, fill: tb.fill
            } };
          }
          return { type: 'SHAPE', locked: false, json: {} };
        });
        const res = await fetch(`/api/slides/${slide.id}/elements`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ elements })
        });
        if (!res.ok) throw new Error('save failed');
        setSaving('saved');
      } catch (_) {
        setSaving('offline');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [slide?.id, setSaving]);

  const addText = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const t = new fabric.Textbox('Text', { left: 100, top: 100, fontSize: 24, fill: '#0A1F1A' });
    canvas.add(t);
    canvas.setActiveObject(t);
  };

  const chip = useMemo(() => {
    if (saving === 'saving') return <span className="chip border-primary text-primary">🌀 Saving…</span>;
    if (saving === 'saved') return <span className="chip border-green-500 text-green-600">✅ All changes saved</span>;
    if (saving === 'offline') return <span className="chip border-yellow-500 text-yellow-600">⚠️ Offline – pending sync</span>;
    return null;
  }, [saving]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!presentation) return <div className="p-6">Not found</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="logo" width={24} height={24}/>
            <span className="font-medium">{presentation.title}</span>
          </Link>
          <div className="ml-3">{chip}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-primary" onClick={addText}>Add Text</button>
          <button
            className="btn-primary"
            onClick={async () => {
              const email = prompt('Invite user by email:');
              const role = prompt('Role (VIEWER/EDITOR):', 'VIEWER');
              if (!email || !role) return;
              await fetch('/api/permissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ presentationId: presentation.id, email, role }) });
              alert('Invitation updated.');
            }}
          >Share</button>
          <button
            className="btn-primary"
            onClick={async () => {
              const payload = { slideJSON: { elements: slide?.elements || [] }, summary: presentation?.title };
              const res = await fetch('/api/ai/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              const data = await res.json();
              alert(`AI Assist\nIssues: ${data.issues.map((i: any) => i.issue).join(', ')}\nLayout: ${data.suggestion.layout}`);
            }}
          >AI Assist</button>
          <Link className="btn-primary" href={`/view/${presentation.id}`}>Preview</Link>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 border-r p-3 bg-gray-50">
          <div className="text-xs text-gray-500 mb-2">Slides</div>
          <div className="aspect-video bg-white border rounded"/>
        </aside>
        <main className="flex-1 grid place-items-center p-4">
          <div id="canvas-wrapper" className="w-full max-w-5xl">
            <canvas id="fabric-canvas" className="w-full h-full border rounded bg-white" />
          </div>
        </main>
        <aside className="w-72 border-l p-3">
          <div className="text-sm font-medium mb-2">Properties</div>
          <div className="text-xs text-gray-500">Select an object to edit.</div>
        </aside>
      </div>
    </div>
  );
}

