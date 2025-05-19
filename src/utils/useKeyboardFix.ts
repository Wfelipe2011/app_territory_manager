import { useEffect } from 'react';

export function useKeyboardFix(onResize: () => void) {
  useEffect(() => {
    const handler = () => {
      // Aguarda o keyboard fechar 100ms e aplica a correção
      setTimeout(() => {
        onResize();
      }, 100);
    };

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [onResize]);
}
