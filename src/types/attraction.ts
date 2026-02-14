export type Waiting = {
  ticketType: string;
  estimatedWaitMinutes: number;
  waitingCount: number;
}

export type RideMinutesItem = {
  rideId: number;
  estimatedWaitMinutes: number;
};

export type RidesMinutesSocketMessage = {
  rides: RideMinutesItem[];
};

export type RideInfoSocketMessage = {
  rideId: number;
  waitTimes: Waiting[];
};

export type AttractionListResponseDto = {
  rideId: number;
  name: string;
  shortDescription: string;
  operatingTime: string;
  waitTimes: Waiting[];
  photo: string;
};

export type AttractionDetailResponseDto = {
  rideId: number;
  name: string;
  ridingTime: number;
  isActive: boolean;
  capacityTotal: number;
  capacityPremium: number;
  capacityGeneral: number;
  shortDescription: string;
  longDescription: string;
  photo: string;
  operatingTime: string;
  waitTimes: Waiting[];
};

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
