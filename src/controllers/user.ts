import { NextFunction, Request, Response } from "express";

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    res.json('get user by id called');
}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    res.json('get all users called');
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    res.json('update user called');
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    res.json('delete user called');
}