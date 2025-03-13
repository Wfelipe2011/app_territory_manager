'use client';

import Head from 'next/head';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { Mode, RootModeScreen } from '@/common/loading';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState<Mode>('loading');

  useEffect(() => {
    window.location.href = `https://admin.territory-manager.com.br/`;
  }, [])

  return (
    <main>
      <Head>
        <title>Territory Manager</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <RootModeScreen mode={isLoading}>
        <></>
      </RootModeScreen>
    </main>
  );
}
