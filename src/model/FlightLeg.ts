import { AirportOption } from "./airportmodel";
export interface FlightLeg {
  fromAirport: AirportOption;
  toAirport: AirportOption;
  fromDate: string;
  returnDate: string | null;
  depTime: string | null;
  returnDepTime: string | null;
  searchTextOne: string;
  searchTextTwo: string;
  fromAirportValid: boolean;
  toAirportValid: boolean;
  departureTime: string;
  dateOpened: boolean;
  returnDateOpened: boolean;
  from: string;
  to: string;
  fromId: string;
  toId: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  ts: number;
}