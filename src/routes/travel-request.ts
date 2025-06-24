import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../global-error-handler";
import { createTravelRequest, getAllTravelRequests, getTravelRequestById, updateTravelRequest, deleteTravelRequest, searchTravelRequests } from "../controllers/travel-request";

export const travelRequestRouter: Router = Router();

travelRequestRouter.post('/', authMiddleware, errorHandler(createTravelRequest));
travelRequestRouter.get('/search', authMiddleware, errorHandler(searchTravelRequests));
travelRequestRouter.get('/:id', authMiddleware, errorHandler(getTravelRequestById));
travelRequestRouter.get('/', authMiddleware, errorHandler(getAllTravelRequests));
travelRequestRouter.put('/:id', authMiddleware, errorHandler(updateTravelRequest));
travelRequestRouter.delete('/:id', authMiddleware, errorHandler(deleteTravelRequest));
