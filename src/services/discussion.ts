import { UUID } from "crypto";
import { IDiscussionRepository } from "../repositories/discussion";
import { CreateDiscussion } from "../interfaces/discussion";
import { DiscussionResponseDto, DiscussionWithSenderResponseDto } from "../dtos/discussion";
import { userService } from "../controllers/user";
import { NotFoundException } from "../exceptions/not-found";
import { ForbiddenException } from "../exceptions/forbidden";
import { ErrorCode } from "../exceptions/root";
import { Role } from "../interfaces/user";

export class DiscussionService {
    constructor(private discussionRepo: IDiscussionRepository) { }

    async create(senderId: UUID, data: CreateDiscussion): Promise<DiscussionResponseDto> {
        const user = await userService.getUserById(senderId);
        if (!user) {
            throw new NotFoundException(`User not found`, ErrorCode.USER_NOTFOUND);
        }

        const discussion = await this.discussionRepo.create(senderId, data);
        return new DiscussionResponseDto(discussion);
    }

    async getByTravelPlanId(travelPlanId: UUID): Promise<DiscussionWithSenderResponseDto[]> {
        const discussions = await this.discussionRepo.getByTravelPlanId(travelPlanId);
        return discussions.map((discussion) => new DiscussionWithSenderResponseDto(discussion));
    }

    async getById(id: UUID): Promise<DiscussionWithSenderResponseDto> {
        const discussion = await this.discussionRepo.getById(id);
        if (!discussion) {
            throw new NotFoundException(`Discussion not found`, ErrorCode.DISCUSSION_NOT_FOUND);
        }

        return new DiscussionWithSenderResponseDto(discussion);
    }

    async delete(id: UUID, userId: UUID): Promise<void> {
        const discussion = await this.discussionRepo.getById(id);
        if (!discussion) {
            throw new NotFoundException(`Discussion not found`, ErrorCode.DISCUSSION_NOT_FOUND);
        }

        const user = await userService.getUserById(userId);
        if (!user) {
            throw new NotFoundException(`User not found`, ErrorCode.USER_NOTFOUND);
        }

        if (discussion.sender.id !== userId && user.role !== Role.ADMIN) {
            throw new ForbiddenException(`User ${userId} is not allowed to delete this discussion`, ErrorCode.FORBIDDEN);
        }

        await this.discussionRepo.delete(id);
    }

    async search(params: Record<string, any>): Promise<DiscussionWithSenderResponseDto[]> {
        const results = await this.discussionRepo.search(params);
        return results.map((discussion) => new DiscussionWithSenderResponseDto(discussion));
    }
}
