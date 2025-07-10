import { UUID } from "crypto";
import { CreateTourTransport, TourTransport, TourTransportWithTransport } from "../../interfaces/tour-transport";
import { TransportResponseDto } from "../transport";

export class TourTransportResponseDto {
  id: UUID;
  travelplan_id: string;
  transport_id: string;
  departure_time: Date;
  contact_number: string;
  created_at: Date;
  updated_at: Date;

  constructor(data: TourTransport) {
    this.id = data.id;
    this.travelplan_id = data.travelplan_id;
    this.transport_id = data.transport_id;
    this.departure_time = data.departure_time;
    this.contact_number = data.contact_number;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

export class CreateTourTransportDto {
  travelplan_id: string;
  transport_id: string;
  departure_time: Date;
  contact_number: string;

  constructor(data: CreateTourTransport) {
    this.travelplan_id = data.travelplan_id;
    this.transport_id = data.transport_id;
    this.departure_time = new Date(data.departure_time);
    this.contact_number = data.contact_number;
  }
}

export class TourTransportWithTransportDto extends TourTransportResponseDto {
  transport: TransportResponseDto;

  constructor(data: TourTransportWithTransport) {
    super(data);
    this.transport = new TransportResponseDto(data.transport);
  }
}
