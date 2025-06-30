import { UUID } from "crypto";
import { db } from "../configs/db";
import { BlogInsight, CreateBlogInsight, UpdateBlogInsight } from "../interfaces/blog-insight";
import { IBlogInsightRepository } from "../repositories/blog-insight";

export class BlogInsightRepository implements IBlogInsightRepository {
    private tableName = "blog_insights";

    async create(userId: UUID, blogId: UUID, insight: CreateBlogInsight): Promise<BlogInsight> {
        const [newInsight] = await db(this.tableName)
            .insert({
                ...insight,
                user_id: userId,
                blog_id: blogId
            })
            .returning("*");

        return {
            ...newInsight,
            created_at: new Date(newInsight.created_at),
            updated_at: new Date(newInsight.updated_at),
        };
    }

    async getAll(): Promise<BlogInsight[]> {
        const insights = await db(this.tableName).select("*");

        return insights.map(insight => ({
            ...insight,
            created_at: new Date(insight.created_at),
            updated_at: new Date(insight.updated_at),
        }));
    }

    async getByBlogId(blogId: UUID): Promise<BlogInsight[]> {
        const insights = await db(this.tableName)
            .where({ blog_id: blogId })
            .select("*");

        return insights.map(insight => ({
            ...insight,
            created_at: new Date(insight.created_at),
            updated_at: new Date(insight.updated_at),
        }));
    }

    async getById(id: UUID): Promise<BlogInsight | null> {
        const insight = await db(this.tableName).where({ id }).first("*");

        return insight ? {
            ...insight,
            created_at: new Date(insight.created_at),
            updated_at: new Date(insight.updated_at),
        } : null;
    }

    async update(id: UUID, data: UpdateBlogInsight): Promise<BlogInsight> {
        const [updatedInsight] = await db(this.tableName)
            .where({ id })
            .update({ ...data, updated_at: new Date() })
            .returning("*");

        return {
            ...updatedInsight,
            created_at: new Date(updatedInsight.created_at),
            updated_at: new Date(updatedInsight.updated_at),
        };
    }

    async delete(id: UUID): Promise<void> {
        await db(this.tableName).where({ id }).del();
    }

    async search(params: {
        label?: string;
        data?: string;
        blog_id?: UUID;
        user_id?: UUID;
        sortBy?: "label" | "created_at";
        order?: "asc" | "desc";
    }): Promise<BlogInsight[]> {
        const {
            label,
            data,
            blog_id,
            user_id,
            sortBy,
            order = "asc"
        } = params;

        const query = db(this.tableName).select("*");

        if (label) {
            query.whereILike("label", `%${label}%`);
        }

        if (data) {
            query.whereILike("data", `%${data}%`);
        }

        if (blog_id) {
            query.where("blog_id", blog_id);
        }

         if (user_id) {
            query.where("user_id", user_id);
        }

        if (sortBy) {
            query.orderBy(sortBy, order);
        } else {
            query.orderBy("created_at", "desc");
        }

        const results = await query;

        return results.map(insight => ({
            ...insight,
            created_at: new Date(insight.created_at),
            updated_at: new Date(insight.updated_at),
        }));
    }
}
