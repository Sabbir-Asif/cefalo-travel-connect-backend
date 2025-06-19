import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../global-error-handler";
import { createFood, deleteFood, getAllFoods, getFoodById, searchFoods, updateFood } from "../controllers/food";

export const foodRouter : Router = Router();

foodRouter.post('/', authMiddleware, errorHandler(createFood));
foodRouter.get('/search', authMiddleware, errorHandler(searchFoods));
foodRouter.get('/:id', authMiddleware, errorHandler(getFoodById));
foodRouter.get('/', authMiddleware, errorHandler(getAllFoods));
foodRouter.put('/:id', authMiddleware, errorHandler(updateFood));
foodRouter.delete('/:id', authMiddleware, errorHandler(deleteFood));