'use client';

import * as React from 'react';
import { RecoilRoot } from 'recoil';

import '@/styles/globals.css';
// !STARTERCONF This is for demo purposes, remove @/styles/colors.css import immediately
import '@/styles/colors.css';

// !STARTERCONF Change these default meta
// !STARTERCONF Look at @/constant/config to change them

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RecoilRoot>
      <html>
        <body>{children}</body>
      </html>
    </RecoilRoot>
  );
}
