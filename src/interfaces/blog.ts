export enum Blog_Status {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}

export interface Blog {
    id: number;
    title: string;
    userId: number;
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
}

export interface CreateBlog {
    title: string;
    locationName: string;
    location_points: {
        lat: number;
        long: number;
    };
    description: string;
    tags?: string[];
    images?: string[];
    videos?: string[];
}