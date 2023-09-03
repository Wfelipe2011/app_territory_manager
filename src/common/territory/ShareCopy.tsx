import { useState } from "react";
import { Check, Copy, Share2 } from "react-feather";

import { navigatorShare } from "@/utils/share";

interface ShareProps {
  id: number;
  signatureKey?: string;
  message: {
    title: string;
    text: string;
    url: string;
  };
  actions: { share(id: number): void };
}

export function ShareCopy(props: ShareProps) {
  const { signatureKey, message, actions, id } = props
  const { title, text, url } = message

  const [copySuccess, setCopySuccess] = useState(false);

  async function copyToClipboard() {
    setCopySuccess(true);
    await navigatorShare({ title, text, url, });
    setTimeout(() => {
      setCopySuccess(false);
    }, 7000)
  };

  return (
    <div className='p-2 cursor-pointer mr-2'>
      {
        signatureKey ? (<CopyComponent copySuccess={copySuccess} onClick={copyToClipboard} />) : (<Share2 onClick={() => actions.share(id)} size={24} />)
      }
    </div>
  )
}

const CopyComponent = ({ copySuccess, onClick }: { copySuccess: boolean, onClick }) => {
  return (
    copySuccess ? (
      <Check className='text-primary' />
    ) : (
      <Copy className='text-gray-700' onClick={onClick} />
    )

  );
}