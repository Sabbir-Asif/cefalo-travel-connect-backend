import { UnprocessableEntityException } from './../exceptions/validation';
import { Request, Response } from "express"
import { CreateLodgeSchema, UpdateLodgeSchema } from "../schemas/lodge";
import { ErrorCode } from "../exceptions/root";
import { CreateLodge, Lodge } from '../interfaces/lodge';
import { CreateLodgeDto, UpdateLodgeDto } from '../dtos/lodge';
import { LodgeService } from '../services/lodge';
import { LodgeRepository } from '../infrastructure/lodge-impl';
import { IdSchema } from '../schemas/id';
import { BadRequestException } from '../exceptions/bad-request';
import { UUID } from 'crypto';
import { HttpStatusCode } from '../interfaces/status-code';

const lodgeRespository = new LodgeRepository();
export const lodgeService = new LodgeService(lodgeRespository);

export const createLodge = async (req: Request, res: Response) => {
    const parsed = CreateLodgeSchema.safeParse(req.body);
    if(!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation Error!", ErrorCode.UNPROCESSABLE_ENTITY)
    }

    const lodgeCreateDto : CreateLodge = new CreateLodgeDto(parsed.data);

    const lodge : Lodge = await lodgeService.createLodge(lodgeCreateDto);

    res.status(HttpStatusCode.CREATED).json(lodge);
}

export const getAllLodges = async (req: Request, res: Response) => {
    const lodges: Lodge[] = await lodgeService.getAllLodges();

    res.status(HttpStatusCode.OK).json(lodges);
}

export const getLodgeById = async (req: Request, res: Response) => {
    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if(!parsedId.success) {
        throw new BadRequestException('Invalid lodge id', ErrorCode.INVALID_LODGE_ID);
    }

    const lodgeId = parsedId.data as UUID;

    const lodge = await lodgeService.getLodgeById(lodgeId);

    res.status(HttpStatusCode.OK).json(lodge);
}

export const updateLodge = async (req: Request, res: Response) => {
    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if(!parsedId.success) {
        throw new BadRequestException('Invalid lodge id', ErrorCode.INVALID_LODGE_ID);
    }

    const lodgeId = parsedId.data as UUID;

    const parsed = UpdateLodgeSchema.safeParse(req.body);

    if(!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation Error!", ErrorCode.UNPROCESSABLE_ENTITY)
    }

    const lodgeUpdateDto = new UpdateLodgeDto(parsed.data);

    const lodge: Lodge = await lodgeService.updateLodge(lodgeId, lodgeUpdateDto);

    res.status(HttpStatusCode.OK).json(lodge);
}

export const deleteLodge = async (req: Request, res: Response) => {
    const Id = req.params.id;
    const parsedId = IdSchema.safeParse(Id);
    if(!parsedId.success) {
        throw new BadRequestException('Invalid lodge id', ErrorCode.INVALID_LODGE_ID);
    }

    const lodgeId = parsedId.data as UUID;

    await lodgeService.deleteLodge(lodgeId);

    res.status(HttpStatusCode.NO_CONTENT).json({success : true});
}

export const getLodgeLocationNames = async (req: Request, res: Response) => {
    const locations = await lodgeService.getAllLocations();

    res.status(HttpStatusCode.OK).json(locations);
}

export const searchLodge = async (req: Request, res: Response) => {
    const queryParams = req.query;

    const results = await lodgeService.searchLodge(queryParams);

    res.status(HttpStatusCode.OK).json(results);
}