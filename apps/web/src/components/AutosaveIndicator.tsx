import React from 'react';

export function AutosaveIndicator(props: { state: 'saving' | 'saved' | 'offline' }): JSX.Element {
  const { state } = props;
  const label = state === 'saving' ? 'Saving…' : state === 'saved' ? 'All changes saved' : 'Offline — pending sync';
  const icon = state === 'saving' ? '🌀' : state === 'saved' ? '✅' : '⚠️';
  const color = state === 'saving' ? '#0070f3' : state === 'saved' ? '#007e33' : '#b7791f';
  return (
    <div title={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color }}>
      <span aria-hidden>{icon}</span>
      <span style={{ fontSize: 12 }}>{label}</span>
    </div>
  );
}


