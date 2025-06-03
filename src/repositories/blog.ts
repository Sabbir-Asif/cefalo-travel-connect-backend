import { Blog, CreateBlog } from "../interfaces/blog";

export interface IBlogRepository {
    create(userId:number, blog: CreateBlog) : Promise<Blog>
    getAll(): Promise<Blog[]>
    getById(id: number): Promise<Blog | null>
}