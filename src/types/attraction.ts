export type Waiting = {
    ticketType: string;
    estimatedWaitMinutes: number;
    waitingCount: number;
}

export interface AttractionSummary {
    attractionId: number;
    name: string;
    description: string;
    operatingTime: string;
    generalWaitingTime: number;
    imageUrl: string;
}

export interface AttractionDetail {
    attractionId: number;
    name: string;
    isActive: boolean;
    capacityTotal: number;
    capacityPremium: number;
    capacityGeneral: number;
    operatingTime: string;
    shortDescription: string;
    longDescription: string;
    ridingTime: number;
    waitTimes: Waiting[];
    imageUrl: string;
}
