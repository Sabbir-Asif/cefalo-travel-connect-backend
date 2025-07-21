import { Request, Response } from "express";
import { TourLodgeRepository } from "../infrastructure/tour-lodge-impl";
import { TourLodgeService } from "../services/tour-lodge";
import { TourLodgeSchema } from "../schemas/tour-lodge";
import { IdSchema } from "../schemas/id";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { UUID } from "crypto";
import { TourLodgeDto } from "../dtos/travel-plan/tour-lodge";
import { HttpStatusCode } from "../interfaces/status-code";

const tourLodgeRepository = new TourLodgeRepository();
const tourLodgeService = new TourLodgeService(tourLodgeRepository);

export const createTourLodge = async (req: Request, res: Response) => {
  const parsed = TourLodgeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const dto = new TourLodgeDto(parsed.data as { travelplan_id: UUID; lodge_id: UUID });
  const { travelplan_id, lodge_id } = dto;
  const result = await tourLodgeService.createTourLodge(travelplan_id, lodge_id);

  res.status(HttpStatusCode.CREATED).json(result);
};

export const deleteTourLodge = async (req: Request, res: Response) => {
  const travelplanId = IdSchema.safeParse(req.params.travelplanId);
  const lodgeId = IdSchema.safeParse(req.params.lodgeId);

  if (!travelplanId.success) {
    throw new UnprocessableEntityException(travelplanId.error, "Invalid travel plan ID", ErrorCode.INVALID_TRAVEL_PLAN_ID);
  }
  if (!lodgeId.success) {
    throw new UnprocessableEntityException(lodgeId.error, "Invalid lodge ID", ErrorCode.INVALID_LODGE_ID);
  }

  const deleted = await tourLodgeService.deleteTourLodge(travelplanId.data as UUID, lodgeId.data as UUID);
  res.status(HttpStatusCode.NO_CONTENT).json({ deleted });
};

export const getLodgesForTravelPlan = async (req: Request, res: Response) => {
  const parsedId = IdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    throw new UnprocessableEntityException(parsedId.error, "Invalid travel plan ID", ErrorCode.INVALID_TRAVEL_PLAN_ID);
  }

  const lodges = await tourLodgeService.getLodgesForTravelPlan(parsedId.data as UUID);

  res.status(HttpStatusCode.OK).json(lodges);
};
