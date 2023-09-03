import { IActions, ITerritoryCard } from "@/common/territories/type";
import { ShareCopy } from "@/common/territory/ShareCopy";

interface HeaderButtonsProps {
  territoryCard: ITerritoryCard;
  actions: IActions;
}

export const HeaderButtons = ({ territoryCard, actions }: HeaderButtonsProps) => {
  return (
    <div className='flex items-center justify-end gap-2'>
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
      {/* <Button.Root
        onClick={() => actions.changeRound(territoryCard.territoryId)}
        variant='ghost'
        className='h-8 w-8 !rounded-full !p-0'
      >
        {territoryCard.hasRounds ? <Pause size={16} /> : <Play size={16} />}
      </Button.Root> */}
    </div>
  );
};