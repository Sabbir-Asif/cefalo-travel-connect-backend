export enum TransportType {
  BUS = "BUS",
  TRAIN = "TRAIN",
  FLIGHT = "FLIGHT",
  BOAT = "BOAT",
  OTHER = "OTHER"
}

export interface Transport {
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
}

export interface CreateTransport {
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
}

