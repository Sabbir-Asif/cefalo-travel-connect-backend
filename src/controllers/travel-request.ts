import { Request, Response } from "express";
import { UUID } from "crypto";
import { IdSchema } from "../schemas/id";
import { ErrorCode } from "../exceptions/root";
import { UnprocessableEntityException } from "../exceptions/validation";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { BadRequestException } from "../exceptions/bad-request";
import { TravelRequestService } from "../services/travel-request";
import { TravelRequestRepository } from "../infrastructure/travel-request-impl";
import { CreateTravelRequestSchema, UpdateTravelRequestSchema } from "../schemas/travel-request";
import { CreateTravelRequest, UpdateTravelRequest, TravelRequest } from "../interfaces/travel-request";
import { CreateTravelRequestDto, UpdateTravelRequestDto } from "../dtos/travel-request";

const travelRequestRepository = new TravelRequestRepository();
export let travelRequestService = new TravelRequestService(travelRequestRepository);

export const __setTravelRequestService = (svc: TravelRequestService) => {
    travelRequestService = svc;
};

export const createTravelRequest = async (req: Request, res: Response) => {
    const parsed = CreateTravelRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
    }

    const userFrom = parsedUserId.data as UUID;
    const createData = parsed.data as CreateTravelRequest;

    const travelRequestDto = new CreateTravelRequestDto(createData);

    const newRequest: TravelRequest = await travelRequestService.createTravelRequest(userFrom, travelRequestDto);

    res.status(201).json(newRequest);
};

export const getAllTravelRequests = async (_req: Request, res: Response) => {
    const travelRequests = await travelRequestService.getAllTravelRequests();
    
    res.status(200).json(travelRequests);
};

export const getTravelRequestById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) {
        throw new BadRequestException("Invalid travel request id", ErrorCode.INVALID_TRAVEL_REQUEST_ID);
    }

    const travelRequestId = parsedId.data as UUID;
    const travelRequest = await travelRequestService.getTravelRequestById(travelRequestId);

    res.status(200).json(travelRequest);
};

export const updateTravelRequest = async (req: Request, res: Response) => {
    const id = req.params.id;
    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) {
        throw new BadRequestException("Invalid travel request id", ErrorCode.INVALID_TRAVEL_REQUEST_ID);
    }

    const travelRequestId = parsedId.data as UUID;

    const parsed = UpdateTravelRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
    }

    const userId = parsedUserId.data as UUID;
    const updateData = parsed.data as UpdateTravelRequest;

    const travelRequestDto = new UpdateTravelRequestDto(updateData);
    const updatedRequest = await travelRequestService.updateTravelRequest(travelRequestId, userId, travelRequestDto);

    res.status(200).json(updatedRequest);
};

export const deleteTravelRequest = async (req: Request, res: Response) => {
    const id = req.params.id;
    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) {
        throw new BadRequestException("Invalid travel request id", ErrorCode.INVALID_TRAVEL_REQUEST_ID);
    }

    const travelRequestId = parsedId.data as UUID;
    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
    }

    const userId = parsedUserId.data as UUID;

    await travelRequestService.deleteTravelRequest(travelRequestId, userId);

    res.status(204).json({ success: true });
};

export const searchTravelRequests = async (req: Request, res: Response) => {
    const queryParams = req.query;
    const travelRequests = await travelRequestService.searchTravelRequests(queryParams);
    res.status(200).json(travelRequests);
};
