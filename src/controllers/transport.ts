import { Request, Response } from "express";
import { TransportRepository } from "../repositories/impl/transport-impl";
import { TransportService } from "../services/transport";
import { CreateTransportSchema, UpdateTransportSchema } from "../schemas/transport";
import { UnprocessableEntityException } from "../exceptions/validation";
import { ErrorCode } from "../exceptions/root";
import { CreateTransport, Transport, TransportType, UpdateTransport } from "../interfaces/transport";
import { CreateTransportDto, UpdateTransportDto } from "../dtos/transport";
import { BadRequestException } from "../exceptions/bad-request";


const transportRepository = new TransportRepository();
const transportService = new TransportService(transportRepository);

export const getTransportById = async (req: Request, res: Response) => {
    const transportId = parseInt(req.params.id);
    if(isNaN(transportId)) {
        throw new BadRequestException('Invalid transport id!', ErrorCode.INVALID_TRANSPORT_ID);
    }

    const transport = await transportService.getTransportById(transportId);

    res.status(200).json(transport);
}

export const getAllTransports = async (req: Request, res: Response) => {
    const transports: Transport[] = await transportService.getAllTransports();

    res.status(200).json(transports);
}

export const createTransport = async (req: Request, res: Response) => {
   const parsed = CreateTransportSchema.safeParse(req.body);
   if(!parsed.success) {
    throw new UnprocessableEntityException(parsed.error, "Validation Error!", ErrorCode.UNPROCESSABLE_ENTITY);
   }

   const transportCreateDto: CreateTransport = new CreateTransportDto({
       ...parsed.data,
       type: parsed.data.type as TransportType
   });

   const transport: Transport = await transportService.createTransport(transportCreateDto);

   res.status(201).json(transport);
}

export const updateTransport = async (req: Request, res: Response) => {
    const transportId = parseInt(req.params.id);
    const parsed = UpdateTransportSchema.safeParse(req.body);

    if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
    }

    if (isNaN(transportId)) {
        throw new BadRequestException('Invalid transport id!', ErrorCode.INVALID_TRANSPORT_ID);
    }

    const transportUpdateDto = new UpdateTransportDto({
        ...parsed.data,
        type: parsed.data.type as TransportType | undefined 
    });

    const transport: Transport = await transportService.updateTransport(transportId, transportUpdateDto as UpdateTransport);

    res.status(200).json(transport);
}

export const deleteTransport = async (req: Request, res: Response) => {
    const transportId = parseInt(req.params.id);
    if (isNaN(transportId)) {
        throw new BadRequestException('Invalid transport id!', ErrorCode.INVALID_TRANSPORT_ID);
    }

    const deletedCount = await transportService.deleteTransport(transportId);

    res.status(204).json(deletedCount);
}

export const getAllStartingLocations = async (req: Request, res: Response) => {
    res.send('get all starting locations called');
}

export const getAllDestinationLocations = async (req: Request, res: Response) => {
    res.send('get all destination locations called');
}

