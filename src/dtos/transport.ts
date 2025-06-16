import { CreateTransport, Transport, TransportType, UpdateTransport } from "../interfaces/transport";

export class CreateTransportDto {
  type: TransportType;
  name: string;
  starting_location: string;
  starting_point: {
    lat: number;
    long: number;
  };
  destination: string;
  destination_point: {
    lat: number;
    long: number;
  };
  departure_time?: string | null;
  arrival_time?: string | null;
  fare: string;

  constructor(data: CreateTransport) {
    this.type = data.type ?? TransportType.OTHER;
    this.name = data.name;
    this.starting_location = data.starting_location;
    this.starting_point = {
      lat: data.starting_point.lat,
      long: data.starting_point.long,
    };
    this.destination = data.destination;
    this.destination_point = {
      lat: data.destination_point.lat,
      long: data.destination_point.long,
    };
    this.departure_time = data.departure_time ?? null;
    this.arrival_time = data.arrival_time ?? null;
    this.fare = data.fare;
  }
}

export class UpdateTransportDto {
  type?: string;
  name?: string;
  starting_location?: string;
  starting_point?: {
    lat: number;
    long: number;
  };
  destination?: string;
  destination_point?: {
    lat: number;
    long: number;
  };
  departure_time?: string | null;
  arrival_time?: string | null;
  fare?: string;

  constructor(data: UpdateTransport) {
    this.type = data.type;
    this.name = data.name;
    this.starting_location = data.starting_location;

    if (data.starting_point) {
      this.starting_point = {
        lat: data.starting_point.lat,
        long: data.starting_point.long,
      };
    }

    this.destination = data.destination;

    if (data.destination_point) {
      this.destination_point = {
        lat: data.destination_point.lat,
        long: data.destination_point.long,
      };
    }

    this.departure_time = data.departure_time ?? null;
    this.arrival_time = data.arrival_time ?? null;
    this.fare = data.fare;
  }
}

export class TransportResponseDto {
  id: number;
  type: TransportType;
  name: string;
  starting_location: string;
  starting_point: {
    lat: number;
    long: number;
  };
  destination: string;
  destination_point: {
    lat: number;
    long: number;
  };
  departure_time: Date | null;
  arrival_time: Date | null;
  fare: string;
  created_at: Date;
  updated_at: Date;

  constructor(data: Transport) {
    this.id = data.id;
    this.type = data.type;
    this.name = data.name;
    this.starting_location = data.starting_location;
    this.starting_point = {
      lat: data.starting_point.lat,
      long: data.starting_point.long,
    };
    this.destination = data.destination;
    this.destination_point = {
      lat: data.destination_point.lat,
      long: data.destination_point.long,
    };
    this.departure_time = data.departure_time;
    this.arrival_time = data.arrival_time;
    this.fare = data.fare;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
