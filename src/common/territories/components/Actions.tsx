import { IActions, ITerritoryCard } from "@/common/territories/type";
import { Button } from "@/ui";

interface ActionsProps {
  territoryCard: ITerritoryCard;
  actions: IActions;
  changeOverseer: (overseer: string) => void;
}

export const Actions = ({ territoryCard, actions, changeOverseer }: ActionsProps) => {
  if (territoryCard.signature.key) {
    return (
      <Button.Root
        onClick={() => {
          changeOverseer('')
          actions.revoke(territoryCard.territoryId)
        }}
        className='!justify-start !px-2 text-xs'
        variant='secondary'
      >
        Revogar acesso
      </Button.Root>
    );
  }
  return (
    <div className='flex w-full justify-end'>
      {/* <Button.Root
        variant='secondary'
        className={clsx(
          {
            invisible:
              !territoryCard.overseer ||
              territoryCard.signature.key ||
              territoryCard.overseer === 'Dirigente' ||
              !territoryCard.hasRounds,
          },
          'w-full !px-2 text-xs'
        )}
        onClick={(e) => actions.share(territoryCard.territoryId, e)}
      >
        Enviar <Share2 size={16} />
      </Button.Root> */}
    </div>
  );
};
