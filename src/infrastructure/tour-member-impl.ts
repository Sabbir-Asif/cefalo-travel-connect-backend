import { UUID } from "crypto";
import { db } from "../configs/db";
import { ITourMemberRepository } from "../repositories/tour-member";
import { User } from "../interfaces/user";

export class TourMemberRepository implements ITourMemberRepository {
    private tableName = "tour_members";

    async create(travelplanId: UUID, userId: UUID): Promise<{ travelplan_id: UUID, user_id: UUID }> {
        const [newMember] = await db(this.tableName)
            .insert({ travelplan_id: travelplanId, user_id: userId })
            .returning("*");

        return {
            travelplan_id: newMember.travelplan_id,
            user_id: newMember.user_id
        };
    }

    async delete(travelplanId: UUID, userId: UUID): Promise<number> {
        return await db(this.tableName)
            .where({ travelplan_id: travelplanId, user_id: userId })
            .del();
    }

    async membersForTravelPlan(travelplanId: UUID): Promise<User[]> {
        const users = await db(this.tableName)
            .join("users", "tour_members.user_id", "users.id")
            .where("tour_members.travelplan_id", travelplanId)
            .select('users.*');

        return users.map(user => ({
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
        }));
    }
}
