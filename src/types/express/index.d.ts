import express from "express";
import { UserResponse } from "../../interfaces/user";

declare global {
  namespace Express {
    interface Request {
      user?: UserResponse
    }
  }
}