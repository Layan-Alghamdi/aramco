import type { AppProps } from 'next/app';
import React from 'react';
import { EditorStoreProvider } from '../state/editorStore';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <EditorStoreProvider>
      <Component {...pageProps} />
    </EditorStoreProvider>
  );
}


