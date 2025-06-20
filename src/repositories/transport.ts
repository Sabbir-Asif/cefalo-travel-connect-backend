import { UUID } from "crypto";
import { CreateTransport, Transport, TransportLocation, UpdateTransport } from "../interfaces/transport";

export interface ITransportRepository {
    create(transport: CreateTransport) : Promise<Transport>;
    getAll() : Promise<Transport[]>;
    getById(id: UUID): Promise<Transport | null>;
    update(id: UUID, data: UpdateTransport) : Promise<Transport>;
    delete(id: UUID): Promise<number>;
    search(params: Record<string, any>): Promise<Transport[]>;
    allStratingLocations(): Promise<TransportLocation[]>;
    allDestinationLocations() : Promise<TransportLocation[]>;
}