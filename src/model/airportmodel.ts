export interface AirportOption {
  _id: string;
  city: string;
  elevation: number;
  name: string;
  title: string;
  loc: {
    type: string;
    coordinates: [number, number];
  };
  country: string;
  region: string;
  iata: string;
  continent: string;
  icao: string;
  lat: number;
  lng: number;
  type: string;
  id: string;
  length_ft: number;
  width_ft: number;
  surface: string;
  lastUpdated: string;
  sstr: string;
  tzCode: string;
}