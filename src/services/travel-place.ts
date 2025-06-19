import { UUID } from "crypto";
import { ITravelPlaceRepository } from "../repositories/travel-place";
import { CreateTravelPlace, TravelPlace, UpdateTravelPlace } from "../interfaces/travel-place";
import { userService } from "../controllers/user";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { TravelPlaceResponseDto } from "../dtos/travel-place";
import { Role } from "../interfaces/user";
import { ForbiddenException } from "../exceptions/forbidden";

export class TravelPlaceService {
    constructor(private travelPlaceRepository: ITravelPlaceRepository) { };

    async createTravelPlace(userId: UUID, travelPlaceData: CreateTravelPlace): Promise<TravelPlace> {
        try {
            const user = await userService.getUserById(userId);
        } catch (err) {
            throw new NotFoundException(`User not found with id ${userId}`, ErrorCode.USER_NOTFOUND);
        }

        const travelPlace = await this.travelPlaceRepository.create(userId, travelPlaceData);

        return new TravelPlaceResponseDto(travelPlace);
    }

    async getAllTravelPlaces(): Promise<TravelPlace[]> {

        const travelPlaces = await this.travelPlaceRepository.getAll();
        
        return travelPlaces.map(place => new TravelPlaceResponseDto(place));
    }

    async getTravelPlaceById(id: UUID): Promise<TravelPlaceResponseDto> {
        
        const travelPlace = await this.travelPlaceRepository.getById(id);

        if (!travelPlace) {
            throw new NotFoundException(`Travel place not found with id ${id}`, ErrorCode.TRAVEL_PLACE_NOT_FOUND);
        }

        return new TravelPlaceResponseDto(travelPlace);
    }

    async updateTravelPlace(id: UUID, userId: UUID, data: UpdateTravelPlace): Promise<TravelPlace> {
        const travelPlace = await this.travelPlaceRepository.getById(id);
        if(!travelPlace) {
            throw new NotFoundException(`No travel place found with id ${id}`, ErrorCode.TRAVEL_PLACE_NOT_FOUND);
        }

        const user = await userService.getUserById(userId);

        if(userId !== travelPlace.user_id || user.role !== Role.ADMIN) {
            throw new ForbiddenException(`UserId ${userId} can not perform update on blog ${id}`, ErrorCode.FORBIDDEN);
        }

        const updatedTravelPlace = await this.travelPlaceRepository.update(id, data);

        return new TravelPlaceResponseDto(updatedTravelPlace);
    }

    async deleteTravelPlace(id: UUID, userId: UUID) : Promise<void> {
        const existingtravelPlace = await this.travelPlaceRepository.getById(id);
        if(!existingtravelPlace) {
            throw new NotFoundException(`Travel place not found with id ${id}`, ErrorCode.TRAVEL_PLACE_NOT_FOUND);
        }

        const user = await userService.getUserById(userId);

        if(userId !== existingtravelPlace.user_id && user.role !== Role.ADMIN) {
            throw new ForbiddenException(`UserId ${userId} can not perform update on blog ${id}`, ErrorCode.FORBIDDEN);
        }

        await this.travelPlaceRepository.delete(id);
    }

    async searchTravelPlaces(params: Record<string, any>) : Promise<TravelPlace[]> {
        const trvaelPlaces = await this.travelPlaceRepository.search(params);

        return trvaelPlaces.map(travelPlace => new TravelPlaceResponseDto(travelPlace));
    }
}