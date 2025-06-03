import { Blog, CreateBlog } from "../interfaces/blog";

export interface IBlogRepository {
    create(userId:number, blog: CreateBlog) : Promise<Blog>
}

// create(user: CreateUser) : Promise<User>;
// findByEmail(email: string) : Promise<User | null>;
// findById(id: number) : Promise<User | null>;
// findAllUsers() : Promise<User[]>;
// update(id: number, data: UpdateUser) : Promise<User | null>;