import { Router } from "express";
import { authRouter } from "./auth.router";
import { userRouter } from "./user.router";
import { blogRouter } from "./blog.router";
import { transportRouter } from "./transport.router";
import { lodgeRouter } from "./lodge.router";
import { travelPlaceRouter } from "./travel-place.router";
import { foodRouter } from "./food.router";
import { travelPlanRouter } from "./travel-plan.router";
import { wishlistRouter } from "./wishlist.router";
import { travelRequestRouter } from "./travel-request.router";
import emailVerificationRouter from "./email-verification.router";
import { discussionRouter } from "./discussion.router";

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
rootRouter.use('/email-verifications', emailVerificationRouter);
rootRouter.use('/discussions', discussionRouter);