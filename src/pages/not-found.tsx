import { Link2Off } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  return (
    <main>
      <section className='bg-white'>
        <div className='layout flex min-h-screen flex-col items-center justify-center text-center text-black'>
          <Link2Off
            size={30}
            className='drop-shadow-glow animate-flicker text-zinc-800'
          />
          <h1 className='mt-8 text-2xl md:text-4xl'>
            Não encontramos o link que está procurando
          </h1>
          <p className='mt-4 text-lg'>
            Por favor verifique com o dirigente a quadra que irá trabalhar!
          </p>
        </div>
      </section>
    </main>
  );
}
