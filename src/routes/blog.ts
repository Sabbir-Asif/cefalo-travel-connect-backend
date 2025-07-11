import { Router } from "express";
import { createBlog, deleteBlog, getAllBlogs, getBlogWithAllInfo, searchBlogs, updateBlog } from "../controllers/blog";
import { errorHandler } from "../global-error-handler";
import { authMiddleware } from "../middlewares/auth";
import { createBlogtransport, deleteBlogTransport, getTransportsForBlog } from "../controllers/blog-transport";
import { createBlogInsight, deleteBlogInsight, getAllBlogInsights, getBlogInsightById, getBlogInsightsByBlogId, searchBlogInsights, updateBlogInsight } from "../controllers/blog-insight";
import { createBlogLodge, deleteBlogLodge, getLodgesForBlog } from "../controllers/blog-lodge";
import { createBlogFood, deleteBlogFood, getFoodsForBlog } from "../controllers/blog-food";
import { getUsersWhoReacted, reactToBlog, removeReaction } from "../controllers/liked-blog";

export const blogRouter: Router = Router();

blogRouter.post('/transports', authMiddleware, errorHandler(createBlogtransport));
blogRouter.get('/:id/transports', authMiddleware, errorHandler(getTransportsForBlog));
blogRouter.delete('/:blogId/transports/:transportId', authMiddleware, errorHandler(deleteBlogTransport));
blogRouter.get('/search', authMiddleware, errorHandler(searchBlogs));

blogRouter.post('/lodges', authMiddleware, errorHandler(createBlogLodge));
blogRouter.get('/:id/lodges', authMiddleware, errorHandler(getLodgesForBlog))
blogRouter.delete('/:blogId/lodges/:lodgeId', authMiddleware, errorHandler(deleteBlogLodge));

blogRouter.post('/foods', authMiddleware, errorHandler(createBlogFood));
blogRouter.get('/:id/foods', authMiddleware, errorHandler(getFoodsForBlog));
blogRouter.delete('/:blogId/foods/:foodId', authMiddleware, errorHandler(deleteBlogFood));

blogRouter.post("/:blogId/insights", authMiddleware, errorHandler(createBlogInsight));
blogRouter.get("/:blogId/insights", authMiddleware, errorHandler(getBlogInsightsByBlogId));

blogRouter.get("/insights/", authMiddleware, errorHandler(getAllBlogInsights));
blogRouter.get("/insights/search", authMiddleware, errorHandler(searchBlogInsights));
blogRouter.get("/insights/:id", authMiddleware, errorHandler(getBlogInsightById));
blogRouter.put("/insights/:id", authMiddleware, errorHandler(updateBlogInsight));
blogRouter.delete("/insights/:id", authMiddleware, errorHandler(deleteBlogInsight));

blogRouter.post('/react', authMiddleware, errorHandler(reactToBlog));
blogRouter.delete('/:blogId/react', authMiddleware, errorHandler(removeReaction));
blogRouter.get('/:blogId/react', authMiddleware, errorHandler(getUsersWhoReacted));

blogRouter.post('/', authMiddleware, errorHandler(createBlog));
blogRouter.get('/',authMiddleware, errorHandler(getAllBlogs));
blogRouter.get('/:id', authMiddleware, errorHandler(getBlogWithAllInfo));
blogRouter.put('/:id', authMiddleware, errorHandler(updateBlog));
blogRouter.delete('/:id', authMiddleware, errorHandler(deleteBlog));
