import { Request, Response } from "express";
import { TourMemberRepository } from "../infrastructure/tour-member-impl";
import { TourMemberService } from "../services/tour-member";
import { TourMemberSchema } from "../schemas/tour-member";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { IdSchema } from "../schemas/id";
import { UUID } from "crypto";
import { TourMemberDto } from "../dtos/travel-plan/tour-member";

const tourMemberRepository = new TourMemberRepository();
export const tourMemberService = new TourMemberService(tourMemberRepository);

export const createTourMember = async (req: Request, res: Response) => {
    const parsed = TourMemberSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    const { travelplan_id, user_id } = new TourMemberDto(parsed.data as TourMemberDto);
    const result = await tourMemberService.createTourMember(travelplan_id, user_id);
    res.status(201).json(result);
};

export const deleteTourMember = async (req: Request, res: Response) => {
    const travelplanId = IdSchema.safeParse(req.params.travelplanId);
    const userId = IdSchema.safeParse(req.params.userId);

    if (!travelplanId.success) {
        throw new UnprocessableEntityException(travelplanId.error, "Invalid travelplan ID", ErrorCode.INVALID_TRAVEL_PLAN_ID);
    }
    if (!userId.success) {
        throw new UnprocessableEntityException(userId.error, "Invalid user ID", ErrorCode.INVALID_USER_ID);
    }

    const deleted = await tourMemberService.deleteTourMember(travelplanId.data as UUID, userId.data as UUID);
    res.status(204).json({ deleted });
};

export const getMembersForTravelPlan = async (req: Request, res: Response) => {
    const travelplanId = IdSchema.safeParse(req.params.id);

    if (!travelplanId.success) {
        throw new UnprocessableEntityException(travelplanId.error, "Invalid travelplan ID", ErrorCode.INVALID_TRAVEL_PLAN_ID);
    }

    const members = await tourMemberService.getMembersForTravelPlan(travelplanId.data as UUID);
    res.status(200).json(members);
};
