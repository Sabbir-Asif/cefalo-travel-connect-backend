import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../global-error-handler";
import { createLodge, deleteLodge, getAllLodges, getLodgeById, getLodgeLocationNames, searchLodge, updateLodge } from "../controllers/lodge";

export const lodgeRouter : Router = Router();

lodgeRouter.post('/', authMiddleware, errorHandler(createLodge));
lodgeRouter.get('/search', authMiddleware, errorHandler(searchLodge));
lodgeRouter.get('/locationNames', authMiddleware, errorHandler(getLodgeLocationNames));
lodgeRouter.get('/:id', authMiddleware, errorHandler(getLodgeById));
lodgeRouter.get('/', authMiddleware, errorHandler(getAllLodges));
lodgeRouter.put('/:id', authMiddleware, errorHandler(updateLodge));
lodgeRouter.delete('/:id', authMiddleware, errorHandler(deleteLodge));