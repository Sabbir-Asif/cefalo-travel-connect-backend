import { UUID } from "crypto";
import { ITravelPlaceRepository } from "../repositories/travel-place";
import { CreateTravelPlace, TravelPlace } from "../interfaces/travel-place";
import { userService } from "../controllers/user";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { TravelPlaceResponseDto } from "../dtos/travel-place";

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
}