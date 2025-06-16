import { CreateTransport, Transport, TransportLocation, UpdateTransport } from "../interfaces/transport";

export interface ITransportRepository {
    create(transport: CreateTransport) : Promise<Transport>;
    getAll() : Promise<Transport[]>;
    getById(id: number): Promise<Transport | null>;
    update(id: number, data: UpdateTransport) : Promise<Transport>;
    delete(id: number): Promise<number>;
    search(params: Record<string, any>): Promise<Transport[]>;
    allStratingLocations(): Promise<TransportLocation[]>;
    allDestinationLocations() : Promise<TransportLocation[]>;
}