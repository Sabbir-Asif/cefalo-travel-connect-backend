import { Request, Response } from "express";

export const signup = async (req: Request, res: Response) => {
    res.send('signup called');
}

export const login = async (req: Request, res: Response) => {
    res.send('login called');
}