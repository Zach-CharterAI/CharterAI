import { FlightLeg } from "./FlightLeg";

export interface Details {
  type: string;
  inquireType: string;
  pax: number;
    categories: string[];
    maxFuelStops: string,
  paxOption: { title: number; value: number };
  safetyRating: {
    isWyvernRatedFilter: boolean;
    isArgusRatedFilter: boolean;
  };
  selectedAircraftIds: string[];
  summaryByCategory: null | any; // You can replace 'any' with the appropriate type
  homeBaseRadNM: number;
  checkRunways: boolean;
}

export interface FlightData {
  opIds: (null | string)[];
  from: string;
  to: string;
  fromId: string;
  toId: string;
  ts: number;
  fromDate: string;
  returnDate: string | null;
  trip: string;
  legs: FlightLeg[];
  details: Details;
  source: string;
  worker: number;
}


