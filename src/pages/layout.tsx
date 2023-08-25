'use client';

import * as React from 'react';

// !STARTERCONF Change these default meta
// !STARTERCONF Look at @/constant/config to change them

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
