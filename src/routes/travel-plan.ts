import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../global-error-handler";
import { createTravelPlan, deleteTravelPlan, getAllTravelPlans, getTravelPlanById, searchTravelPlans, updateTravelPlan } from "../controllers/travel-plan";
import { getDiscussionsByTravelPlanId } from "../controllers/discussion";
import { tourTransportRouter } from "./tour-transport";

export const travelPlanRouter : Router = Router();

travelPlanRouter.use('/transports', authMiddleware, tourTransportRouter);

travelPlanRouter.get("/:travelPlanId/discussions", authMiddleware, errorHandler(getDiscussionsByTravelPlanId));

travelPlanRouter.post('/', authMiddleware, errorHandler(createTravelPlan));
travelPlanRouter.get('/search', authMiddleware, errorHandler(searchTravelPlans));
travelPlanRouter.get('/:id', authMiddleware, errorHandler(getTravelPlanById));
travelPlanRouter.get('/', authMiddleware, getAllTravelPlans);
travelPlanRouter.put('/:id', authMiddleware, errorHandler(updateTravelPlan));
travelPlanRouter.delete('/:id', authMiddleware, errorHandler(deleteTravelPlan));
