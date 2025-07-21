import { TransportRepository } from '../infrastructure/transport-impl';
import { UUID } from "crypto";
import { LodgeResponseDto } from "../dtos/lodge";
import { CreateLodge, Lodge, LodgeLocation, UpdateLodge } from "../interfaces/lodge";
import { ILodgeRepositiry } from "../repositories/lodge";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export class LodgeService {
    constructor(private lodgeRepository: ILodgeRepositiry) {};

    async createLodge(lodgeData: CreateLodge) : Promise<Lodge> {
        const lodge = await this.lodgeRepository.create(lodgeData);

        return new LodgeResponseDto(lodge);
    }

    async getAllLodges() : Promise<Lodge[]> {
        const lodges = await this.lodgeRepository.getAll();

        return lodges.map(lodge => new LodgeResponseDto(lodge));
    }

    async getLodgeById(id: UUID) : Promise<Lodge> {
        const lodge = await this.lodgeRepository.getById(id);

        if(!lodge) {
            throw new NotFoundException(`No lodge found with id ${id}`, ErrorCode.LODGE_NOT_FOUND);
        }

        return new LodgeResponseDto(lodge);
    }

    async updateLodge(id: UUID, data: UpdateLodge) : Promise<Lodge> {
        const existingLodge = await this.lodgeRepository.getById(id);

        if(!existingLodge) {
            throw new NotFoundException(`Lodge not found with id ${id}`, ErrorCode.LODGE_NOT_FOUND);
        }

        const updatedLodge = await this.lodgeRepository.update(id, data);

        return new LodgeResponseDto(updatedLodge);
    }

    async deleteLodge(id: UUID) : Promise<void> {
       const existingLodge = await this.lodgeRepository.getById(id);

        if(!existingLodge) {
            throw new NotFoundException(`Lodge not found with id ${id}`, ErrorCode.LODGE_NOT_FOUND);
        }

        await this.lodgeRepository.delete(id);
    }

    async getAllLocations(): Promise<LodgeLocation[]> {
        return this.lodgeRepository.allLocations();
    }

    async searchLodge(params: Record<string, any>): Promise<Lodge[]> {
        const results = await this.lodgeRepository.search(params);

        return results.map((lodge) => new LodgeResponseDto(lodge));
    }
}