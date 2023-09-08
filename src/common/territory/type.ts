export type IUseTerritory = {
   territory: ITerritory
   actions: IActions
}

export type IActions = {
   share: (blockId: number) => Promise<void>
}


export type ITerritory = {
   territoryId: number
   territoryName: string
   hasRound: boolean
   history: IHistory[]
   blocks: IBlock[]
}

export type IHistory = {
   overseer: string
   initialDate: string
   expiralDate: string
   finished: boolean
}

export type IBlock = {
   id: number
   name: string
   signature: ISignature | null
   negativeCompleted: number
   positiveCompleted: number
   connections: number
}

export type ISignature = {
   key: string
   expirationDate: string
}
