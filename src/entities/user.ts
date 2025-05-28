export enum Role {
    ADMIN = "ADMIN",
    TRAVELER = "TRAVELER",
    EXPLORER = "EXPLORER"
}

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
    displayPicture: string | null;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
}