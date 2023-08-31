import NotFound from "@/pages/not-found";
import { SpiralLoader } from "@/ui/spiral";

function Loading() {
  return (
    <main>
      <section className='bg-gray-50'>
        <div className='layout flex min-h-screen flex-col items-center justify-center text-center text-black'>
          <SpiralLoader />
        </div>
      </section>
    </main>
  );
}

export type Mode = 'loading' | 'screen' | 'not-found';

export const RootModeScreen = ({ children, mode = 'loading' }: {
  children: React.ReactNode;
  mode: Mode;
}) => {
  return (
    <>
      {mode === 'loading' && <Loading />}
      {mode === 'screen' && children}
      {mode === 'not-found' && <NotFound />}
    </>
  );
};