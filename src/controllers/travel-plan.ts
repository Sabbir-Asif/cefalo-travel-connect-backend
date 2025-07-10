import { Request, Response } from "express";
import { TravelPlanRepository } from "../infrastructure/travel-plan-impl";
import { TravelPlanService } from "../services/travel-plan";
import { CreateTravelPlanSchema, UpdateTravelPlanSchema } from "../schemas/travel-plan";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { IdSchema } from "../schemas/id";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { BadRequestException } from "../exceptions/bad-request";
import { UUID } from "crypto";
import { CreateTravelPlan, TravelPlan, TravelPlanStatus, UpdateTravelPlan } from "../interfaces/travel-plan";
import { CreateTravelPlanDto, UpdateTravelPlanDto } from "../dtos/travel-plan/travel-plan";

const travelPlanRepository = new TravelPlanRepository();
export const travelPlanService = new TravelPlanService(travelPlanRepository);

export const createTravelPlan = async (req: Request, res: Response) => {
    const parsed = CreateTravelPlanSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
    }

    const userId = parsedUserId.data as UUID;
    const parsedData = parsed.data as CreateTravelPlan;

    const travelPlanDto: CreateTravelPlan = new CreateTravelPlanDto({
        ...parsedData,
        status: parsedData.status as TravelPlanStatus
    });

    const travelPlan: TravelPlan = await travelPlanService.createTravelPlan(userId, travelPlanDto);

    res.status(201).json(travelPlan);
};

export const getAllTravelPlans = async (req: Request, res: Response) => {
    const travelPlans = await travelPlanService.getAllTravelPlans();

    res.status(200).json(travelPlans);
};

export const getTravelPlanById = async (req: Request, res: Response) => {
    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException("Invalid travel plan id", ErrorCode.INVALID_TRAVEL_PLAN_ID);
    }

    const travelPlanId = parsedId.data as UUID;
    const travelPlan = await travelPlanService.getTravelPlanById(travelPlanId);

    res.status(200).json(travelPlan);
};

export const updateTravelPlan = async (req: Request, res: Response) => {
    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException("Invalid travel plan id", ErrorCode.INVALID_TRAVEL_PLAN_ID);
    }

    const travelPlanId = parsedId.data as UUID;
    const parsed = UpdateTravelPlanSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
    }

    const userId = parsedUserId.data as UUID;
    const parsedData = parsed.data as UpdateTravelPlan;

    const travelPlanUpdateDto: UpdateTravelPlan = new UpdateTravelPlanDto({
        ...parsedData,
        status: parsedData.status as TravelPlanStatus
    });
    const updatedTravelPlan = await travelPlanService.updateTravelPlan(travelPlanId, userId, travelPlanUpdateDto);

    res.status(200).json(updatedTravelPlan);
};

export const deleteTravelPlan = async (req: Request, res: Response) => {
    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if (!parsedId.success) {
        throw new BadRequestException("Invalid travel plan id", ErrorCode.INVALID_TRAVEL_PLAN_ID);
    }

    const travelPlanId = parsedId.data as UUID;
    const rawUserId = req.user?.id;
    const parsedUserId = IdSchema.safeParse(rawUserId);
    if (!parsedUserId.success) {
        throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
    }

    const userId = parsedUserId.data as UUID;
    await travelPlanService.deleteTravelPlan(travelPlanId, userId);

    res.status(204).json({ success: true });
};

export const searchTravelPlans = async (req: Request, res: Response) => {
    const queryParams = req.query;
    const travelPlans = await travelPlanService.searchTravelPlans(queryParams);
    res.status(200).json(travelPlans);
};
