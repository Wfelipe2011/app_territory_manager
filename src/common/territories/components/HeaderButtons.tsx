import { Eye } from "react-feather";

import { ITerritoryCard } from "@/common/territories/type";
import { ITerritoryActions } from "@/common/territories/useTerritories";
import { ShareCopy } from "@/common/territory/ShareCopy";


interface HeaderButtonsProps {
  territoryCard: ITerritoryCard;
  actions: ITerritoryActions;
}

export const HeaderButtons = ({ territoryCard, actions }: HeaderButtonsProps) => {

  return (
    <div className='flex items-center justify-end gap-2'>
      {territoryCard?.signature?.key && (<Eye className='cursor-pointer' onClick={() => actions.blockNavigation(territoryCard.territoryId)} />)}
      {
        territoryCard.overseer && territoryCard.signature.expirationDate && (
          <ShareCopy
            actions={actions}
            id={territoryCard.territoryId}
            message={{
              title: `Território para trabalhar até ${new Date(territoryCard.signature.expirationDate + ' GMT-3').toLocaleDateString()}`,
              url: `${origin}/home?p=territorio/${territoryCard.territoryId}&s=${territoryCard?.signature?.key}`,
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