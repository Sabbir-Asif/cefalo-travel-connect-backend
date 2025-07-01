import { UUID } from "crypto";
import { Blog, Blog_Status, CreateBlog, UpdateBlog } from "../interfaces/blog";

export class CreateBlogDto {
    title: string;
    locationName: string;
    location_points: {
        lat: number;
        long: number;
    };
    cover_image?: string | undefined;
    description: string;
    tags?: string[];
    images?: string[];
    videos?: string[]

    constructor(blogData: CreateBlog) {
        this.title = blogData.title;
        this.locationName = blogData.locationName;
        this.location_points = {
            lat: blogData.location_points.lat,
            long: blogData.location_points.long
        }
        this.cover_image = blogData.cover_image,
            this.description = blogData.description,
            this.tags = blogData.tags
        this.images = blogData.images
        this.videos = blogData.videos
    }
}

export class UpdateBlogDto {
    title?: string;
    locationName?: string;
    location_points?: {
        lat: number;
        long: number;
    };
    cover_image?: string;
    status?: Blog_Status;
    description?: string;
    tags?: string[];
    images?: string[];
    videos?: string[]

    constructor(blogData: UpdateBlog) {
        this.title = blogData.title;
        this.locationName = blogData.locationName;
        if (blogData.location_points) {
            this.location_points = {
                lat: blogData.location_points.lat,
                long: blogData.location_points.long
            }
        }
        this.cover_image = blogData.cover_image
        this.description = blogData.description;
        this.status = blogData.status as Blog_Status | undefined;
        this.tags = blogData.tags,
            this.images = blogData.images,
            this.videos = blogData.videos
    }
}

export class BlogResponseDto {
    id: UUID;
    title: string;
    userId: UUID;
    locationName: string;
    location_points: {
        lat: number;
        long: number;
    };
    description: string;
    cover_image: string | null;
    status: Blog_Status;
    tags: string[];
    images: string[];
    videos: string[];
    created_at: Date;
    updated_at: Date;

    constructor(blogData: Blog) {
        this.id = blogData.id;
        this.userId = blogData.userId;
        this.title = blogData.title;
        this.locationName = blogData.locationName;
        this.location_points = {
            lat: blogData.location_points.lat,
            long: blogData.location_points.long
        }
        this.description = blogData.description,
            this.cover_image = blogData.cover_image,
            this.status = blogData.status,
            this.tags = blogData.tags
        this.tags = blogData.tags,
            this.images = blogData.images,
            this.videos = blogData.videos,
            this.created_at = blogData.created_at,
            this.updated_at = blogData.updated_at
    }
}