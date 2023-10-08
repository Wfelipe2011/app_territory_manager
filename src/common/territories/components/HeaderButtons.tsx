import { useRouter as useNavigation } from 'next/navigation';
import { Eye } from "react-feather";

import { IActions, ITerritoryCard } from "@/common/territories/type";
import { ShareCopy } from "@/common/territory/ShareCopy";

interface HeaderButtonsProps {
  territoryCard: ITerritoryCard;
  actions: IActions;
}

export const HeaderButtons = ({ territoryCard, actions }: HeaderButtonsProps) => {
  const navigation = useNavigation();
  const blockNavigation = () => {
    navigation.push(`/territorio/${territoryCard.territoryId}`);
  }
  return (
    <div className='flex items-center justify-end gap-2'>
      {territoryCard?.signature?.key && (<Eye className='cursor-pointer' onClick={blockNavigation} />)}
      {
        territoryCard.overseer && territoryCard.signature.expirationDate && (
          <ShareCopy
            actions={{ share: actions.share }}
            id={territoryCard.territoryId}
            message={{
              title: `Território para trabalhar até ${new Date(territoryCard.signature.expirationDate + ' GMT-3').toLocaleDateString()}`,
              url: `${origin}/territorio?s=${territoryCard?.signature?.key}`,
              text: `Prezado irmão *_${territoryCard.overseer}_*\nsegue o link para o território *${territoryCard.name}* que você irá trabalhar até ${new Date(
                territoryCard.signature.expirationDate + ' GMT-3'
              ).toLocaleDateString()} \n\n\r`,
            }}
            signatureKey={territoryCard?.signature?.key as string}
            key={territoryCard.territoryId}
          />
        )
      }
    </div>
  );
};