import { CreateUser, Role, User } from '../interfaces/user';

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