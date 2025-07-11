import { BlogReaction, LikedBlog } from './../interfaces/liked-blog';
import { UUID } from "crypto";

export class LikedBlogDto {
    blog_id: UUID;
    user_id: UUID;
    reaction_name: BlogReaction;

    constructor(data: LikedBlog) {
        this.blog_id = data.blog_id;
        this.user_id = data.user_id;
        this.reaction_name = data.reaction_name;
    }
}

export class LikedBlogResponseDto {
    blog_id: UUID;
    user_id: UUID;
    reaction_name: BlogReaction;
    created_at: Date;

    constructor(data: LikedBlog & { created_at: Date }) {
        this.blog_id = data.blog_id;
        this.user_id = data.user_id;
        this.reaction_name = data.reaction_name;
        this.created_at = data.created_at;
    }
}