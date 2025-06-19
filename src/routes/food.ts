import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../global-error-handler";
import { createFood, deleteFood, getAllFoods, getFoodById, updateFood } from "../controllers/food";

export const foodRouter : Router = Router();

foodRouter.post('/', authMiddleware, errorHandler(createFood));
foodRouter.get('/', authMiddleware, errorHandler(getAllFoods));
foodRouter.get('/:id', authMiddleware, errorHandler(getFoodById));
foodRouter.put('/:id', authMiddleware, errorHandler(updateFood));
foodRouter.delete('/:id', authMiddleware, errorHandler(deleteFood));