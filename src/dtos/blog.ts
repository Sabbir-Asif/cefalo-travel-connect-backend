import { Blog, Blog_Status, CreateBlog } from "../interfaces/blog";

export class CreateBlogDto {
    title: string;
    locationName: string;
    locationPoints: {
        lat: number;
        long: number;
    };
    description: string;
    tags: string[];

    constructor(blogData: CreateBlog) {
        this.title = blogData.title;
        this.locationName = blogData.locationName;
        this.locationPoints = {
            lat: blogData.locationPoints.lat,
            long: blogData.locationPoints.long
        }
        this.description = blogData.description,
        this.tags = blogData.tags
    }
}

export class BlogResponseDto {
    id: number;
    title: string;
    userId: number;
    locationName: string;
    locationPoints: {
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
        this.locationPoints = {
            lat: blogData.locationPoints.lat,
            long: blogData.locationPoints.long
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