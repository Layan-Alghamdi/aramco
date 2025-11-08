"use client";
import { useState } from 'react';

export default function BrandSettingsPage() {
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/ai/colors', { method: 'POST', body: fd });
    const data = await res.json();
    setColors(data.colors || []);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">Brand Settings</h1>
      <p className="text-sm text-gray-600 mb-4">Extract brand colors from a logo image.</p>
      <input type="file" accept="image/*" onChange={onUpload} />
      {loading && <div className="mt-3 text-sm">Extracting…</div>}
      {!loading && colors.length > 0 && (
        <div className="mt-4 flex gap-2">
          {colors.map((c) => (
            <div key={c} className="w-10 h-10 rounded border" style={{ backgroundColor: c }} title={c} />
          ))}
        </div>
      )}
    </div>
  );
}

