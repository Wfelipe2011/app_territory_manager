import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';

import '@/styles/globals.css';
import '@/styles/colors.css';
import '@/styles/spiral.css';


export default function App({ Component, pageProps, ...rest }: AppProps) {
  return (
    <RecoilRoot>
      <Component {...pageProps} {...rest} />
    </RecoilRoot>
  );
}
