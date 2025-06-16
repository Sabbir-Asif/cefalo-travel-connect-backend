import { getTransportById } from './../controllers/transport';
import { TransportResponseDto } from "../dtos/transport";
import { CreateTransport, Transport } from "../interfaces/transport";
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
}