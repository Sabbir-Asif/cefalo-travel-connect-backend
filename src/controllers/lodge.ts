import { Request, Response } from "express"

export const createLodge = async (req: Request, res: Response) => {
    res.json('create lodge called');
}

export const getAllLodges = async (req: Request, res: Response) => {
    res.json('get all lodge called');
}

export const getLodgeById = async (req: Request, res: Response) => {
    res.json('get lodge by id called');
}

export const updateLodge = async (req: Request, res: Response) => {
    res.json('update lodge called');
}

export const deleteLodge = async (req: Request, res: Response) => {
    res.json('delete lodge called');
}

export const getLodgeLocationNames = async (req: Request, res: Response) => {
    res.json('lodge location names called');
}