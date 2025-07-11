import { Request, Response } from "express";
import { DiscussionRepository } from "../infrastructure/discussion-impl";
import { DiscussionService } from "../services/discussion";
import { CreateDiscussionSchema } from "../schemas/discussion";
import { IdSchema } from "../schemas/id";
import { UnprocessableEntityException } from "../exceptions/validation";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { UUID } from "crypto";
import { CreateDiscussion } from "../interfaces/discussion";

const discussionRepo = new DiscussionRepository();
export let discussionService = new DiscussionService(discussionRepo);

export const __setDiscussionService = (svc: DiscussionService) => {
  discussionService = svc;
};

export const createDiscussion = async (req: Request, res: Response) => {
  const parsedBody = CreateDiscussionSchema.safeParse(req.body);
  if (!parsedBody.success) {
    throw new UnprocessableEntityException(parsedBody.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const rawUserId = req.user?.id;
  const parsedUserId = IdSchema.safeParse(rawUserId);
  if (!parsedUserId.success) {
    throw new UnauthorizedException("User not found", ErrorCode.USER_NOTFOUND);
  }

  const senderId = parsedUserId.data as UUID;
  const inputData = parsedBody.data as CreateDiscussion;

  const discussion = await discussionService.create(senderId, inputData);

  res.status(201).json(discussion);
};

export const getDiscussionById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid discussion ID", ErrorCode.INVALID_DISCUSSION_ID);
  }

  const discussionId = parsedId.data as UUID;
  const discussion = await discussionService.getById(discussionId);

  res.status(200).json(discussion);
};

export const getDiscussionsByTravelPlanId = async (req: Request, res: Response) => {
  const travelPlanId = req.params.travelPlanId;
  const parsedId = IdSchema.safeParse(travelPlanId);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid travel plan ID", ErrorCode.INVALID_TRAVEL_PLAN_ID);
  }

  const travelPlanUUID = parsedId.data as UUID;
  const discussions = await discussionService.getByTravelPlanId(travelPlanUUID);

  res.status(200).json(discussions);
};

export const deleteDiscussion = async (req: Request, res: Response) => {
  const discussionIdRaw = req.params.id;
  const parsedDiscussionId = IdSchema.safeParse(discussionIdRaw);
  if (!parsedDiscussionId.success) {
    throw new BadRequestException("Invalid discussion ID", ErrorCode.INVALID_DISCUSSION_ID);
  }

  const rawUserId = req.user?.id;
  const parsedUserId = IdSchema.safeParse(rawUserId);
  if (!parsedUserId.success) {
    throw new UnauthorizedException("User not found", ErrorCode.USER_NOTFOUND);
  }

  const discussionId = parsedDiscussionId.data as UUID;
  const userId = parsedUserId.data as UUID;

  await discussionService.delete(discussionId, userId);
  
  res.status(204).json({ success: true });
};

export const searchDiscussions = async (req: Request, res: Response) => {
  const discussions = await discussionService.search(req.query);
  res.status(200).json(discussions);
};
