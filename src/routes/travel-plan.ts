import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../global-error-handler";
import { createTravelPlan, deleteTravelPlan, getAllTravelPlans, getTravelPlanById, searchTravelPlans, updateTravelPlan } from "../controllers/travel-plan";
import { getDiscussionsByTravelPlanId } from "../controllers/discussion";
import { tourTransportRouter } from "./tour-transport";
import { createTourLodge, deleteTourLodge, getLodgesForTravelPlan } from "../controllers/tour-lodge";
import { createTourMember, deleteTourMember, getMembersForTravelPlan } from "../controllers/tour-member";

export const travelPlanRouter : Router = Router();

travelPlanRouter.use('/transports', authMiddleware, tourTransportRouter);

travelPlanRouter.get("/:travelPlanId/discussions", authMiddleware, errorHandler(getDiscussionsByTravelPlanId));

travelPlanRouter.post('/lodges', authMiddleware, errorHandler(createTourLodge));
travelPlanRouter.get('/:id/lodges', authMiddleware, errorHandler(getLodgesForTravelPlan));
travelPlanRouter.delete('/:travelplanId/lodges/:lodgeId', authMiddleware, errorHandler(deleteTourLodge));

travelPlanRouter.post('/members', authMiddleware, errorHandler(createTourMember));
travelPlanRouter.get('/:id/members', authMiddleware, errorHandler(getMembersForTravelPlan));
travelPlanRouter.delete('/:travelplanId/members/:userId', authMiddleware, errorHandler(deleteTourMember));

travelPlanRouter.post('/', authMiddleware, errorHandler(createTravelPlan));
travelPlanRouter.get('/search', authMiddleware, errorHandler(searchTravelPlans));
travelPlanRouter.get('/:id', authMiddleware, errorHandler(getTravelPlanById));
travelPlanRouter.get('/', authMiddleware, getAllTravelPlans);
travelPlanRouter.put('/:id', authMiddleware, errorHandler(updateTravelPlan));
travelPlanRouter.delete('/:id', authMiddleware, errorHandler(deleteTravelPlan));
