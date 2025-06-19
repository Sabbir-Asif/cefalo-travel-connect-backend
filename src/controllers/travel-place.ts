import { Request, Response } from "express";
import { TravelPlaceRepository } from "../repositories/impl/travel-place-impl";
import { TravelPlaceService } from "../services/travel-place";
import { CreateTravelPlaceSchema, UpdateTravelPlaceSchema } from "../schemas/travel-place";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { IdSchema } from "../schemas/id";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { UUID } from "crypto";
import { CreateTravelPlace, TravelPlace, UpdateTravelPlace } from "../interfaces/travel-place";
import { CreateTravelPlaceDto, UpdateTravelPlaceDto } from "../dtos/travel-place";
import { BadRequestException } from "../exceptions/bad-request";

const travelPlaceRepository = new TravelPlaceRepository();
const travelPlaceService = new TravelPlaceService(travelPlaceRepository);

export const createTravelPlace = async (req: Request, res: Response) => {
    const parsed = CreateTravelPlaceSchema.safeParse(req.body)
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);

    if (!parsedUserId.success) {
        throw new UnauthorizedException('User not found!', ErrorCode.USER_NOTFOUND)
    }

    const userId = parsedUserId.data as UUID;

    const travelPlaceCreateDto: CreateTravelPlace = new CreateTravelPlaceDto(parsed.data);

    const travelPlace: TravelPlace = await travelPlaceService.createTravelPlace(userId, travelPlaceCreateDto);

    res.status(201).json(travelPlace);
}

export const getAllTravelPlace = async (req: Request, res: Response) => {
    const travelPlaces: TravelPlace[] = await travelPlaceService.getAllTravelPlaces();

    res.status(200).json(travelPlaces);
}

export const getTravelPlaceById = async (req: Request, res: Response) => {

    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid travel place id', ErrorCode.INVALID_TRAVEL_PLACE_ID);
    }

    const travelPlaceId = parsedId.data as UUID;

    const travelPlace = await travelPlaceService.getTravelPlaceById(travelPlaceId);

    res.status(200).json(travelPlace);
}

export const updateTravelPlace = async (req: Request, res: Response) => {
    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid travel place id', ErrorCode.INVALID_TRAVEL_PLACE_ID);
    }

    const travelPlaceId = parsedId.data as UUID;

    const parsed = UpdateTravelPlaceSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException('User not found!', ErrorCode.USER_NOTFOUND);
    }

    const userId = parsedUserId.data as UUID;

    const travelPlaceUpdateDto: UpdateTravelPlace = new UpdateTravelPlaceDto(parsed.data);

    const updatedTravelPlace: TravelPlace = await travelPlaceService.updateTravelPlace(travelPlaceId, userId, travelPlaceUpdateDto);

    res.status(200).json(updatedTravelPlace);

}

export const deleteTravelPlace = async (req: Request, res: Response) => {
    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException('Invalid travel place id', ErrorCode.INVALID_TRAVEL_PLACE_ID);
    }

    const travelPlaceId = parsedId.data as UUID;

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException('User not found!', ErrorCode.USER_NOTFOUND);
    }

    const userId = parsedUserId.data as UUID;

    await travelPlaceService.deleteTravelPlace(travelPlaceId, userId);

    res.status(204).json({success: true});
}