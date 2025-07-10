import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { errorHandler } from "../middlewares/error-handler";
import { createDiscussion, getDiscussionById, getDiscussionsByTravelPlanId, deleteDiscussion, searchDiscussions } from "../controllers/discussion";

export const discussionRouter: Router = Router();

discussionRouter.post("/", authMiddleware, errorHandler(createDiscussion));
discussionRouter.get("/search", authMiddleware, errorHandler(searchDiscussions));
discussionRouter.get("/:id", authMiddleware, errorHandler(getDiscussionById));
discussionRouter.delete("/:id", authMiddleware, errorHandler(deleteDiscussion));
