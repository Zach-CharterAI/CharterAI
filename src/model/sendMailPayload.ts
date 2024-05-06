import { FlightLeg } from "./FlightLeg";


interface Sender {
  status: string;
  email: string;
  phone: string;
  name: string;
  airEmail: string;
  sendToAirMail: boolean;
}

interface Message {
  subject: string;
  text: string;
}

interface OpDetails {
  [key: string]: {
    fleetSize: number;
    priceRange: any[];
    priceRangeStr: string;
  };
}

export interface SendMailPayload {
  opIds: (null | string)[];
  sender: Sender;
  message: Message;
  comment: string;
  messageByOps: Record<string, unknown>; // You can replace 'unknown' with the appropriate type
  tripType: string;
  pax: number;
  categories: string[];
  specificAircraft: any[]; // You can replace 'any' with the appropriate type
  legs: FlightLeg[];
  opDetails: OpDetails;
}


