import { Dialog, DialogBody, DialogHeader, Typography } from '@material-tailwind/react';
import { Map, X } from 'react-feather';

import { SimpleRegistrationForm } from '@/components/Organisms/SimpleRegistrationForm';

export function DialogForm({ open, setOpen }) {
  const handleOpen = () => setOpen(!open);

  return (
    <div className='absolute top-0 right-0 m-6 z-20'>
      <Dialog open={open} handler={handleOpen}>
        <div className='flex justify-between'>
          <DialogHeader>
            <div className="flex gap-2">
              <Typography variant="h5" color="blue-gray">
                Território 01 - Jd. Magnólias
              </Typography>
            </div>
          </DialogHeader>
          <X className='m-4 cursor-pointer' onClick={handleOpen} />
        </div>
        <DialogBody>
          <SimpleRegistrationForm />
        </DialogBody>
      </Dialog>
    </div>
  );
}