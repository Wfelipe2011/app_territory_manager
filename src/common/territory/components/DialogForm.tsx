import { Dialog, DialogBody, DialogHeader, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { X } from 'react-feather';

import { SimpleRegistrationForm } from '@/components/Organisms/SimpleRegistrationForm';
import { streetGateway } from '@/infra/Gateway/StreetGateway';
import { Mode, RootModeScreen } from '@/common/loading';

// {
//   "id": 13604,
//   "number": "1793",
//   "complement": null,
//   "legend": "Comércio",
//   "order": 3,
//   "dontVisit": false,
//   "observations": null,
//   "blockId": 17,
//   "addressId": 193,
//   "phone": null,
//   "territoryId": 79,
//   "tenantId": 2,
//   "address": {
//       "id": 193,
//       "name": "Avenida General Carneiro",
//       "tenantId": 2
//   },
//   "territory": {
//       "id": 79,
//       "name": "01-Jd. Magnolias 01",
//       "tenantId": 2,
//       "typeId": 5,
//       "imageUrl": null
//   },
//   "block": {
//       "id": 17,
//       "name": "Quadra 1",
//       "tenantId": 2
//   }
// }

export function DialogForm({ open, setOpen, blockOptions }) {
  const [isLoading, setIsLoading] = useState<Mode>('loading');
  const handleOpen = () => setOpen(true);
  const handleClosed = () => setOpen(false);
  const [house, setHouse] = useState({
    title: '',
    form: {
      street: '',
      number: '',
      legend: '',
      dontVisit: '',
      block: '',
    }
  });

  useEffect(() => {
    setIsLoading('screen')
    if (!isNaN(+String(open))) {
      setIsLoading('loading')
      streetGateway.getHouseById(open).then((result) => {
        setHouse({
          title: result.data.territory.name,
          form: {
            street: result.data.address.name,
            number: result.data.number,
            legend: result.data.legend,
            dontVisit: result.data.dontVisit,
            block: result.data.block.name,
          }
        })
        setIsLoading('screen')
      })
    }

    return () => {
      setIsLoading('loading')
      setHouse({
        title: '',
        form: {
          street: '',
          number: '',
          legend: '',
          dontVisit: '',
          block: '',
        }
      })
    }
  }, [open])

  return (
    <div className='absolute top-0 right-0 m-6 z-20'>
      <Dialog open={open} handler={handleOpen}>
        <RootModeScreen mode={isLoading}>
          <div className='flex justify-between'>
            <DialogHeader>
              <div className="flex gap-2 p-2">
                <Typography variant="h5" color="blue-gray">
                  {house.title}
                </Typography>
              </div>
            </DialogHeader>
            <X className='m-4 cursor-pointer' onClick={handleClosed} />
          </div>
          <DialogBody>
            <SimpleRegistrationForm blockOptions={blockOptions} form={house.form} />
          </DialogBody>
        </RootModeScreen>
      </Dialog>
    </div>
  );
}