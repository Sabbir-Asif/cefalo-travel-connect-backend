import { CreateUser, Role, UpdateUser, User } from '../interfaces/user';

export class CreateUserDto {
    name: string;
    email: string;
    password: string;

    constructor(data: CreateUser) {
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
    };
}

export class UpdateUserDto {
    name?: string;
    role?: Role;
    displayPicture?: string | null;
    bio?: string | null;

    constructor(data: UpdateUser) {
        this.name = data.name;
        this.role = data.role !== undefined ? data.role as Role : undefined;
        this.displayPicture = data.displayPicture ?? null;
        this.bio = data.bio ?? null;
    }
}

export class UserResponseDto {
    id: number;
    name: string;
    email: string;
    role: Role;
    displayPicture: string | null;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: User) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.role = data.role;
        this.displayPicture = data.displayPicture;
        this.bio = data.bio;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

}
