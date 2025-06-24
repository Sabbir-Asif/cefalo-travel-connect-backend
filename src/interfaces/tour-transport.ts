import { UUID } from "crypto";
import { Transport } from "./transport";

export interface TourTransport {
  id: UUID;
  travelplan_id: UUID;
  transport_id: UUID;
  departure_time: Date;
  contact_number: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTourTransport {
  travelplan_id: UUID;
  transport_id: UUID;
  departure_time: Date;
  contact_number: string;
}

export interface UpdateTourTransport {
  departure_time?: Date;
  contact_number?: string;
}

export interface TourTransportWithTransport extends TourTransport {
  transport: Transport;
}
