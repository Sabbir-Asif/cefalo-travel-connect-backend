import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../middlewares/error-handler";
import { createTourTransport, getAllTourTransports, getTourTransportById, updateTourTransport, deleteTourTransport, searchTourTransports } from "../controllers/tour-transport";

export const tourTransportRouter: Router = Router();

tourTransportRouter.post("/", authMiddleware, errorHandler(createTourTransport));
tourTransportRouter.get("/search", authMiddleware, errorHandler(searchTourTransports));
tourTransportRouter.get("/:id", authMiddleware, errorHandler(getTourTransportById));
tourTransportRouter.get("/", authMiddleware, errorHandler(getAllTourTransports));
tourTransportRouter.put("/:id", authMiddleware, errorHandler(updateTourTransport));
tourTransportRouter.delete("/:id", authMiddleware, errorHandler(deleteTourTransport));
