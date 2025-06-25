import { UUID } from "crypto";
import { CreateTourTransport, TourTransportWithTransport, UpdateTourTransport } from "../interfaces/tour-transport";

export interface ITourTransportRepository {
  create(data: CreateTourTransport): Promise<TourTransportWithTransport>;
  getAll(): Promise<TourTransportWithTransport[]>;
  getById(id: UUID): Promise<TourTransportWithTransport | null>;
  update(id: UUID, data: UpdateTourTransport): Promise<TourTransportWithTransport>;
  delete(id: UUID): Promise<void>;
  search(params: Record<string, any>): Promise<TourTransportWithTransport[]>;
}
