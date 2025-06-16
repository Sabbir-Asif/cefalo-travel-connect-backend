import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../global-error-handler";
import { createTransport, deleteTransport, getAllDestinationLocations, getAllStartingLocations, getAllTransports, getTransportById, searchTransports, updateTransport } from "../controllers/transport";

export const transportRouter : Router = Router();
transportRouter.get('/search',authMiddleware, errorHandler(searchTransports));
transportRouter.get('/startingLocationNames', authMiddleware, errorHandler(getAllStartingLocations));
transportRouter.get('/destinationLocationNames', authMiddleware, errorHandler(getAllDestinationLocations));
transportRouter.get('/:id', authMiddleware, errorHandler(getTransportById));
transportRouter.get('/', authMiddleware, errorHandler(getAllTransports));
transportRouter.post('/', authMiddleware, errorHandler(createTransport));
transportRouter.put('/:id', authMiddleware, errorHandler(updateTransport));
transportRouter.delete('/:id', authMiddleware, errorHandler(deleteTransport));