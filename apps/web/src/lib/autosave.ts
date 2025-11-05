import React from 'react';

type AutosaveQueueItem = {
  id: string; // slide id
  payload: unknown;
};

type AutosaveStatus = 'saving' | 'saved' | 'offline';

const LOCAL_KEY = 'autosaveQueue:v1';

function loadQueue(): AutosaveQueueItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveQueue(q: AutosaveQueueItem[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(q));
  } catch {
    // ignore
  }
}

export function useAutosave(slideId: string, data: unknown, debounceMs = 800) {
  const [status, setStatus] = React.useState<AutosaveStatus>('saved');
  const queueRef = React.useRef<AutosaveQueueItem[]>(loadQueue());
  const timerRef = React.useRef<number | null>(null);

  const flushQueue = React.useCallback(async () => {
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }
    const current = [...queueRef.current];
    if (current.length === 0) return;
    setStatus('saving');
    try {
      // batch-like sequential flush
      while (queueRef.current.length) {
        const next = queueRef.current[0];
        await fakePutSlide(next.id, next.payload);
        queueRef.current.shift();
        saveQueue(queueRef.current);
      }
      setStatus('saved');
    } catch {
      // remain queued
      setStatus('offline');
    }
  }, []);

  React.useEffect(() => {
    const onOnline = () => flushQueue();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flushQueue]);

  React.useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatus(navigator.onLine ? 'saving' : 'offline');
    timerRef.current = window.setTimeout(async () => {
      const item = { id: slideId, payload: data };
      if (!navigator.onLine) {
        queueRef.current.push(item);
        saveQueue(queueRef.current);
        setStatus('offline');
        return;
      }
      try {
        await fakePutSlide(slideId, data);
        setStatus('saved');
      } catch {
        queueRef.current.push(item);
        saveQueue(queueRef.current);
        setStatus('offline');
      }
    }, debounceMs) as unknown as number;
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [slideId, data, debounceMs]);

  return { status, flushQueue } as const;
}

// Replace with real API call: PUT /slides/:id
async function fakePutSlide(id: string, payload: unknown): Promise<void> {
  // Simulate network latency and occasional failure
  await new Promise((r) => setTimeout(r, 150));
  if (!navigator.onLine) throw new Error('offline');
  // In real impl: await fetch(`/api/slides/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}


