import { Request, Response } from "express";
import { TourTransportRepository } from "../repositories/impl/tour-transport-impl";
import { TourTransportService } from "../services/tour-transport";
import { IdSchema } from "../schemas/id";
import { CreateTourTransportSchema, UpdateTourTransportSchema } from "../schemas/tour-transport";
import { UnprocessableEntityException } from "../exceptions/validation";
import { BadRequestException } from "../exceptions/bad-request";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { CreateTourTransport, UpdateTourTransport } from "../interfaces/tour-transport";
import { UUID } from "crypto";
import { CreateTourTransportDto } from "../dtos/tour-transport";

const tourTransportRepo = new TourTransportRepository();
export let tourTransportService = new TourTransportService(tourTransportRepo);

export const __setTourTransportService = (svc: TourTransportService) => {
  tourTransportService = svc;
};

export const createTourTransport = async (req: Request, res: Response) => {
  const parsed = CreateTourTransportSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const rawUserId = req.user?.id;
  const parsedUserId = IdSchema.safeParse(rawUserId);
  if (!parsedUserId.success) {
    throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
  }

  const parsedData = parsed.data as CreateTourTransport;

  const tourTransportCreateDto = new CreateTourTransportDto(parsedData);
  const userId = parsedUserId.data as UUID;

  const created = await tourTransportService.create(userId, tourTransportCreateDto as CreateTourTransport);
  res.status(201).json(created);
};

export const getAllTourTransports = async (_req: Request, res: Response) => {
  const tourTransports = await tourTransportService.getAll();

  res.status(200).json(tourTransports);
};

export const getTourTransportById = async (req: Request, res: Response) => {
  const parsedId = IdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid tour transport id", ErrorCode.INVALID_TOUR_TRANSPORT_ID);
  }

  const id = parsedId.data as UUID;
  const result = await tourTransportService.getById(id);
  res.status(200).json(result);
};

export const updateTourTransport = async (req: Request, res: Response) => {
  const parsedId = IdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid tour transport id", ErrorCode.INVALID_TOUR_TRANSPORT_ID);
  }

  const parsedBody = UpdateTourTransportSchema.safeParse(req.body);
  if (!parsedBody.success) {
    throw new UnprocessableEntityException(parsedBody.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const userId = req.user?.id;
  const parsedUserId = IdSchema.safeParse(userId);
  if (!parsedUserId.success) {
    throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
  }

  const id = parsedId.data as UUID;
  const updateData: UpdateTourTransport = parsedBody.data;

  const updatedTourTransport = await tourTransportService.update(id, parsedUserId.data as UUID, updateData);

  res.status(200).json(updatedTourTransport);
};

export const deleteTourTransport = async (req: Request, res: Response) => {
  const parsedId = IdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid tour transport id", ErrorCode.INVALID_TOUR_TRANSPORT_ID);
  }

  const userId = req.user?.id;
  const parsedUserId = IdSchema.safeParse(userId);
  if (!parsedUserId.success) {
    throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
  }

  await tourTransportService.delete(parsedId.data as UUID, parsedUserId.data as UUID);
  res.status(204).json({ success: true });
};

export const searchTourTransports = async (req: Request, res: Response) => {
  const results = await tourTransportService.search(req.query);
  res.status(200).json(results);
};
