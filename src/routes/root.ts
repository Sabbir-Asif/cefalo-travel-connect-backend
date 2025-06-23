import { Router } from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { blogRouter } from "./blog";
import { transportRouter } from "./transport";
import { lodgeRouter } from "./lodge";
import { travelPlaceRouter } from "./travel-place";
import { foodRouter } from "./food";
import { travelPlanRouter } from "./travel-plan";
import { wishlistRouter } from "./wishlist";
import { travelRequestRouter } from "./travel-request";
import emailVerificationRouter from "./email-verification";

export const rootRouter: Router = Router();

rootRouter.use('/auth',authRouter);
rootRouter.use('/users',userRouter);
rootRouter.use('/blogs',blogRouter);
rootRouter.use('/transports',transportRouter);
rootRouter.use('/lodges', lodgeRouter);
rootRouter.use('/travel-places', travelPlaceRouter);
rootRouter.use('/foods', foodRouter);
rootRouter.use('/travel-plans', travelPlanRouter);
rootRouter.use('/wishlists', wishlistRouter);
rootRouter.use('/travel-requests', travelRequestRouter);
rootRouter.use('/email-verifications', emailVerificationRouter)