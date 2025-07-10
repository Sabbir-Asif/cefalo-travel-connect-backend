import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../middlewares/error-handler";
import { createTravelPlace, deleteTravelPlace, getAllTravelPlace, getTravelPlaceById, searchTravelPlaces, updateTravelPlace } from "../controllers/travel-place";

export const travelPlaceRouter : Router = Router();

travelPlaceRouter.get('/search', authMiddleware, errorHandler(searchTravelPlaces));
travelPlaceRouter.get('/:id', authMiddleware, errorHandler(getTravelPlaceById));
travelPlaceRouter.get('/', authMiddleware, errorHandler(getAllTravelPlace));
travelPlaceRouter.post('/', authMiddleware, errorHandler(createTravelPlace));
travelPlaceRouter.put('/:id', authMiddleware, errorHandler(updateTravelPlace));
travelPlaceRouter.delete('/:id', authMiddleware, errorHandler(deleteTravelPlace));