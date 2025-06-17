import { UUID } from "crypto";
import { Blog, CreateBlog, UpdateBlog } from "../interfaces/blog";

export interface IBlogRepository {
    create(userId:UUID, blog: CreateBlog) : Promise<Blog>;
    getAll(): Promise<Blog[]>;
    getById(id: UUID): Promise<Blog | null>;
    update(id: UUID, data: UpdateBlog) : Promise<Blog>;
    delete(id: UUID): Promise<number>;
    search(params: Record<string, any>): Promise<Blog[]>;
}