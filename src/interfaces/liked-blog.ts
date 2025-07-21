import { UUID } from 'crypto';

export enum BlogReaction {
    Inspired = 'inspired',
    Amazed = 'amazed',
    Useful = 'useful',
    Curious = 'curious',
}

export interface LikedBlog {
    blog_id: UUID;
    user_id: UUID;
    reaction_name: BlogReaction;
}

export interface LikedBlogResponse {
    blog_id: UUID;
    user_id: UUID;
    reaction_name: BlogReaction;
    created_at: Date;
}
