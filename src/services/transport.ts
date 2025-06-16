import { deleteTransport, getTransportById } from './../controllers/transport';
import { TransportResponseDto } from "../dtos/transport";
import { CreateTransport, Transport, UpdateTransport } from "../interfaces/transport";
import { ITransportRepository } from "../repositories/transport";
import { NotFoundException } from '../exceptions/not-found';
import { ErrorCode } from '../exceptions/root';

export class TransportService {
    constructor(private transportRepository: ITransportRepository) {};

    async createTransport(transportData: CreateTransport): Promise<Transport> {

        const transport = await this.transportRepository.create(transportData);

        return new TransportResponseDto(transport);
    }

    async getAllTransports() : Promise<Transport[]> {
        const transports = await this.transportRepository.getAll();

        return transports.map(transport => new TransportResponseDto(transport));
    }

    async getTransportById(id: number): Promise<Transport> {
        const transport = await this.transportRepository.getById(id);

        if(!transport) {
            throw new NotFoundException(`No transport found with id ${id}`, ErrorCode.TRANSPORT_NOT_FOUND);
        }

        return new TransportResponseDto(transport);
    }

    async updateTransport(id: number, data: UpdateTransport): Promise<Transport> {
        const existingTransport = await this.transportRepository.getById(id);

        if(!existingTransport) {
            throw new NotFoundException(`Transport not found with id ${id}`, ErrorCode.TRANSPORT_NOT_FOUND);
        }

        const updatedTransport = await this.transportRepository.update(id,data);

        return new TransportResponseDto(updatedTransport);
    }

    async deleteTransport(id: number): Promise<number> {
        const existingTransport = await this.transportRepository.getById(id);

        if(!existingTransport) {
            throw new NotFoundException(`Transport not found with id ${id}`, ErrorCode.TRANSPORT_NOT_FOUND);
        }

        return this.transportRepository.delete(id);
    }
}