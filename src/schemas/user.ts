import { z } from 'zod'

export const CreateUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6)
})

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

export const UserUpdateSchema = z.object({
    name: z.string().optional(),
    role: z.enum(['ADMIN', 'EXPLORER', 'TRAVELER']).optional(),
    displayPicture: z.string().nullable().optional(),
    bio: z.string().nullable().optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.'
});
