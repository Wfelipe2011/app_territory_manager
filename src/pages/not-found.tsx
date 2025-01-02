import { AlertTriangle, HelpCircle, Link2Off, Lock, ServerCrash, ShieldClose, TimerOff } from 'lucide-react';
import { Metadata } from 'next';
import * as React from 'react';
import { useRecoilState } from 'recoil';

import { authState } from '@/states/auth';
import { useRouter } from 'next/router';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  const [message, setMessage] = React.useState<any>()
  const [values, setValues] = useRecoilState(authState);
  const router = useRouter();
  const { codeError } = router.query; // Pegando a query da rota

  React.useEffect(() => {
    if (!codeError && values.notFoundStatusCode) {
      router.push(`/not-found?codeError=${values.notFoundStatusCode}`);
      return;
    }

    if (codeError) {
      const errorCode = parseInt(codeError as string, 10); // Converte `codeError` para número
      switch (errorCode) {
        case 400:
          setMessage({
            title: 'Solicitação inválida',
            message: 'A solicitação feita parece estar incorreta. Verifique se todos os campos estão preenchidos corretamente e tente novamente.',
            icon: <AlertTriangle size={30} className='drop-shadow-glow animate-flicker text-red-500' />
          });
          break;
        case 401:
          setMessage({
            title: 'Acesso não autorizado',
            message: 'Você não possui permissão para acessar este recurso. Verifique se está devidamente autenticado ou entre em contato com o suporte para obter assistência.',
            icon: <Lock size={30} className='drop-shadow-glow animate-flicker text-red-500' />
          });
          break;
        case 403:
          setMessage({
            title: 'Acesso negado',
            message: 'Você não tem permissão para acessar este link. Por favor, entre em contato com o remetente para obter as permissões necessárias.',
            icon: <ShieldClose size={30} className='drop-shadow-glow animate-flicker text-red-500' />
          });
          break;
        case 404:
          setMessage({
            title: 'Link não encontrado',
            message: 'O link que você está tentando acessar não existe ou foi removido. Por favor, verifique com o remetente do link para mais informações.',
            icon: <Link2Off size={30} className='drop-shadow-glow animate-flicker text-zinc-800' />
          });
          break;
        case 405:
          setMessage({
            title: 'Link expirado',
            message: 'O link que você está tentando acessar expirou. Entre em contato com o remetente para obter um novo link válido.',
            icon: <TimerOff size={30} className='drop-shadow-glow animate-flicker text-zinc-800' />
          });
          break;
        case 500:
          setMessage({
            title: 'Problema temporário',
            message: 'Estamos enfrentando problemas temporários no servidor. Por favor, tente novamente mais tarde ou entre em contato com o suporte se o problema persistir.',
            icon: <ServerCrash size={30} className='drop-shadow-glow animate-flicker text-red-500' />
          });
          break;
        default:
          setMessage({
            title: 'Oops! Algo deu errado',
            message: 'Encontramos um problema inesperado. Por favor, tente novamente mais tarde ou entre em contato com o suporte para obter ajuda adicional.',
            icon: <HelpCircle size={30} className='drop-shadow-glow animate-flicker text-zinc-800' />
          });
          break;
      }
    }
  }
    , [codeError, router, values])
  return message ? (<main>
    <section className='bg-gray-50'>
      <div className='layout flex min-h-screen flex-col items-center justify-center text-center text-black'>
        {message.icon}
        <h1 className='mt-8 text-2xl md:text-4xl'>
          {message.title}
        </h1>
        <p className='mt-4 text-lg'>
          {message.message}
        </p>
      </div>
    </section>
  </main>) : null
}
