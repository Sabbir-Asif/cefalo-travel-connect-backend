import { UUID } from "crypto";
import { db } from "../../configs/db";
import { IDiscussionRepository } from "../discussion";
import { CreateDiscussion, Discussion, DiscussionWithSender } from "../../interfaces/discussion";

export class DiscussionRepository implements IDiscussionRepository {
  private table = "discussions";

  async create(senderId: UUID, data: CreateDiscussion): Promise<Discussion> {
    const [created] = await db(this.table)
      .insert({
        travel_plan_id: data.travel_plan_id,
        sender_id: senderId,
        content: data.content,
      })
      .returning("*");

    return this.toModel(created);
  }

  async getByTravelPlanId(travelPlanId: UUID): Promise<DiscussionWithSender[]> {
    const results = await db
      .select("discussions.*", db.raw("row_to_json(users.*) as sender"))
      .from(this.table)
      .leftJoin("users", "discussions.sender_id", "users.id")
      .where("travel_plan_id", travelPlanId)
      .orderBy("created_at", "asc");

    return results.map(this.toModelWithSender);
  }

  async getById(id: UUID): Promise<DiscussionWithSender | null> {
    const result = await db
      .select("discussions.*", db.raw("row_to_json(users.*) as sender"))
      .from(this.table)
      .leftJoin("users", "discussions.sender_id", "users.id")
      .where("discussions.id", id)
      .first();

    return result ? this.toModelWithSender(result) : null;
  }

  async delete(id: UUID): Promise<void> {
    await db(this.table).where({ id }).del();
  }

  async search(params: Record<string, any>): Promise<DiscussionWithSender[]> {
    const { travel_plan_id, sender_id, content, sortBy = "created_at", order = "asc" } = params;

    const query = db
      .select("discussions.*", db.raw("row_to_json(users.*) as sender"))
      .from(this.table)
      .leftJoin("users", "discussions.sender_id", "users.id");

    if (travel_plan_id) query.where("travel_plan_id", travel_plan_id);
    if (sender_id) query.where("sender_id", sender_id);
    if (content) query.whereILike("content", `%${content}%`);

    query.orderBy(sortBy, order);

    const results = await query;
    return results.map(this.toModelWithSender);
  }

  private toModel = (row: any): Discussion => ({
    id: row.id,
    travel_plan_id: row.travel_plan_id,
    sender_id: row.sender_id,
    content: row.content,
    created_at: new Date(row.created_at),
  });

  private toModelWithSender = (row: any): DiscussionWithSender => ({
    ...this.toModel(row),
    sender: row.sender,
  });
}
