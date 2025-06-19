import { Request, Response } from "express";

export const createFood = async (req: Request, res: Response) => {
    res.json(`create food called`);
}

export const getAllFoods = async (req: Request, res: Response) => {
    res.json(`get all food called`);
}

export const getFoodById = async (req: Request, res: Response) => {
    res.json(`get food by id called`);
}

export const updateFood = async (req: Request, res: Response) => {
    res.json(`update food called`);
}

export const deleteFood = async (req: Request, res: Response) => {
    res.json(`delete food called`);
}