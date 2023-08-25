import { AppProps } from 'next/app';
import { StrictMode } from 'react';
import { RecoilRoot } from 'recoil';

import '@/styles/globals.css';
// !STARTERCONF This is for demo purposes, remove @/styles/colors.css import immediately
import '@/styles/colors.css';

export default function App({ Component, pageProps, ...rest }: AppProps) {
  return (
    <StrictMode>
      <RecoilRoot>
        <Component {...pageProps} {...rest} />
      </RecoilRoot>
    </StrictMode>
  );
}
