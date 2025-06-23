import { UUID } from 'crypto';
import { CreateUser, Role, UpdateUser, User } from '../interfaces/user';

export class CreateUserDto {
    name: string;
    email: string;
    phone_number: string;
    password: string;

    constructor(data: CreateUser) {
        this.name = data.name;
        this.email = data.email;
        this.phone_number = data.phone_number;
        this.password = data.password;
    };
}

export class UpdateUserDto {
    name?: string;
    role?: Role;
    displayPicture?: string | null;
    phone_number?: string;
    bio?: string | null;

    constructor(data: UpdateUser) {
        this.name = data.name;
        this.role = data.role !== undefined ? data.role as Role : undefined;
        this.displayPicture = data.displayPicture ?? null;
        this.phone_number = data.phone_number ?? undefined;
        this.bio = data.bio ?? null;
    }
}

export class UserResponseDto {
    id: UUID;
    name: string;
    email: string;
    role: Role;
    displayPicture: string | null;
    phone_number: string;
    bio: string | null;
    is_verified: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: User) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.role = data.role;
        this.phone_number = data.phone_number;
        this.displayPicture = data.displayPicture;
        this.bio = data.bio;
        this.is_verified = data.is_verified;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}

