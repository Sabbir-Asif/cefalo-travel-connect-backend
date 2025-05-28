
export enum Role {
    ADMIN,
    TRAVELER,
    EXPLORER
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